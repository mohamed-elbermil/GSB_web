const Bill = require('../models/Bill_model')
const User = require('../models/user_model')
const { uploadToS3 } = require('../utils/s3')

const createBill = async (req, res) => {
    try {
        const { date, amount, merchant, description, status, type } = JSON.parse(req.body.metadata)
        console.log(date, amount, merchant, description, status, type)
        const { id } = req.user
        
        // Handle file upload
        let proofUrl
        if (req.file) {
            // Vérifier si S3 est configuré
            if (process.env.ID && process.env.SECRET && process.env.BUCKET_NAME) {
                proofUrl = await uploadToS3(req.file)
            } else {
                // Fallback: simuler un URL si S3 n'est pas configuré
                console.log('S3 non configuré - utilisation du fallback')
                proofUrl = `https://via.placeholder.com/300x200.png?text=${encodeURIComponent(req.file.originalname)}`
            }
        } else {
            throw new Error('Proof image is required', { cause: 400 })
        }
        
        const bill = new Bill({ 
            date: date, 
            amount: amount, 
            merchant: merchant,
            proof: proofUrl, 
            description: description, 
            status: status, 
            type: type, 
            user: id 
        })
        await bill.save()
        res.status(201).json(bill)
    } catch (error) { 
        if (error['cause'] === 400) {
            res.status(400).json({ message: error.message })
        } else {
            console.error('Error creating bill:', error)
            res.status(500).json({ message: "Server error" })
        }
    }
}

const getBills = async (req, res) => {
    try {
        const { id, role } = req.user
        let bills
        console.log("Récupération factures - User ID:", id, "Role:", role)
        console.log("Type de role:", typeof role, "Role en minuscules:", role?.toLowerCase())

        // Vérification plus flexible du rôle d'admin
        const isAdmin = role && (role.toLowerCase() === 'admin' || role.toLowerCase() === 'administrator')
        console.log("Est admin?", isAdmin)

        if (isAdmin) {
            console.log("Récupération de toutes les factures pour l'admin:", id)
            // Pour les admins, récupérer toutes les factures sans populate pour éviter les erreurs
            bills = await Bill.find({})
            console.log("Nombre de factures trouvées pour admin:", bills.length)
            
            // Ajouter manuellement les infos utilisateur pour chaque facture
            for (let bill of bills) {
                try {
                    if (bill.user) {
                        const user = await User.findById(bill.user).select('name email')
                        bill.user = user
                    }
                } catch (err) {
                    console.log("Utilisateur non trouvé pour la facture:", bill._id)
                    bill.user = null
                }
            }
            
            // Filtrer les factures où l'utilisateur n'existe pas
            bills = bills.filter(bill => bill.user !== null)
            console.log("Nombre de factures finales après filtrage:", bills.length)
        } else {
            console.log("Récupération des factures pour l'utilisateur:", id)
            bills = await Bill.find({ user: id })
            console.log("Nombre de factures trouvées pour user:", bills.length)
        }
        
        console.log("Factures finales envoyées:", bills.length)
        res.status(200).json(bills)
    } catch (error) {
        console.error("Erreur dans getBills:", error)
        res.status(500).json({ message: "Server error" })
    }
}

const getBillById = async (req, res) => {
    try {
        const { id } = req.params
        const bill = await Bill.findById(id)
        if (!bill) {
            throw new Error('Bill not found', { cause: 404 })
        } else {
            res.status(200).json(bill)
        }
    } catch (error) {
        if (error['cause'] === 404) {
            res.status(404).json({ message: error.message })
        } else {
            res.status(500).json({ message: "Server error" })
        }
    }
}

const updateBill = async (req, res) => {
    try {
        const { id } = req.params
        const { date, amount, proof,merchant, description, status, type } = req.body
        const bill = await Bill.findByIdAndUpdate(
            id,
            { date, amount, proof,merchant, description, status, type },
            { new: true }
        )
        if (!bill) {
            throw new Error('Bill not found', { cause: 404 })
        } else {
            res.status(200).json(bill)
        }
    } catch (error) {
        if (error['cause'] === 404) {
            res.status(404).json({ message: error.message })
        } else {
            res.status(500).json({ message: "Server error" })
        }
    }
}

const deleteBill = async (req, res) => {
    try {
        const { id } = req.params
        const bill = await Bill.findByIdAndDelete(id)
        if (!bill) {
            throw new Error('Bill not found', { cause: 404 })
        }
        res.status(200).json({ message: 'Bill deleted' })
    } catch (error) {
        if (error['cause'] === 404) {
            res.status(404).json({ message: error.message })
        } else {
            res.status(500).json({ message: "Server error" })
        }
    }
}



module.exports = { createBill, getBills, getBillById, updateBill, deleteBill }