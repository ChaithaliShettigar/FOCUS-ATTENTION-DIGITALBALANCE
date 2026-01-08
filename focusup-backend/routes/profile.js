import express from 'express'
import {
  getProfile,
  updateProfile,
  updatePassword,
  togglePublicFocus,
  deleteProfile,
} from '../controllers/profileController.js'
import protect from '../middleware/auth.js'

const router = express.Router()

router.use(protect)

router.get('/', getProfile)
router.put('/', updateProfile)
router.put('/password', updatePassword)
router.post('/toggle-public-focus', togglePublicFocus)
router.delete('/', deleteProfile)

export default router
