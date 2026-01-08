<<<<<<< HEAD
import express from 'express'
import { 
  register, 
  login, 
  logout, 
  refreshToken, 
  changePassword, 
  deleteAccount, 
  getMe 
} from '../controllers/authController.js'
import { protect } from '../middleware/auth.js'
=======
import { Router } from 'express';
import { register, login, getMe } from '../controllers/authController.js';
import auth from '../middleware/auth.js';
>>>>>>> fabba55 (Backend: focus session tracking with WebSocket, route fixes, debug endpoint, docs and testing guide)

const router = Router();

<<<<<<< HEAD
// Public routes
router.post('/register', register)
router.post('/login', login)
router.post('/refresh-token', refreshToken)

// Protected routes
router.use(protect)
router.get('/me', getMe)
router.post('/logout', logout)
router.post('/change-password', changePassword)
router.delete('/account', deleteAccount)
=======
router.post('/register', register);
router.post('/login', login);
router.get('/me', auth, getMe);
>>>>>>> fabba55 (Backend: focus session tracking with WebSocket, route fixes, debug endpoint, docs and testing guide)

export default router;
