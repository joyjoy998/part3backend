require('dotenv').config()
const mongoose = require('mongoose')

const url = process.env.MONGODB_URI

mongoose.set('strictQuery', false)

const phoneValidator = {
  validator: function (v) {
    return /^\d{2,3}-\d+$/.test(v)
  },
  message: (props) => `${props.value} is not a valid phone number!`,
}

mongoose
  .connect(url)
  .then((result) => {
    console.log('connected to MongoDB')
    console.log(result)
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message)
  })

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 3,
    required: true,
  },
  number: {
    type: String,
    required: true,
    validate: phoneValidator,
  },
})

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  },
})

module.exports = mongoose.model('Person', personSchema)
