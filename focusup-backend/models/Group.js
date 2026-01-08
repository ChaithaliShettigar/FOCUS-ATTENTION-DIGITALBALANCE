import mongoose from 'mongoose'

const groupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a group name'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        role: {
          type: String,
          enum: ['admin', 'member'],
          default: 'member',
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    resources: [
      {
        id: String,
        title: String,
        link: String,
        type: String,
        addedBy: mongoose.Schema.Types.ObjectId,
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    leaderboard: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        focusScore: Number,
        totalMinutes: Number,
        rank: Number,
      },
    ],
    isPublic: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
)

export default mongoose.model('Group', groupSchema)
