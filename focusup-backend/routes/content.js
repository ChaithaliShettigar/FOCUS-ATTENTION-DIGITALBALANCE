import express from 'express'
import {
  createContent,
  getContent,
  getSingleContent,
  updateContent,
  deleteContent,
} from '../controllers/contentController.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

router.use(protect)

router.route('/').post(createContent).get(getContent)
router.route('/:id').get(getSingleContent).put(updateContent).delete(deleteContent)

export default router
