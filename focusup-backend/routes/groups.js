import express from 'express'
import {
  createGroup,
  getGroups,
  getGroup,
  addMember,
  removeMember,
  updateGroup,
  deleteGroup,
} from '../controllers/groupController.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

router.use(protect)

router.route('/').post(createGroup).get(getGroups)
router.route('/:id').get(getGroup).put(updateGroup).delete(deleteGroup)
router.post('/:id/add-member', addMember)
router.post('/:id/remove-member', removeMember)

export default router
