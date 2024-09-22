require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()
const Person = require('./models/person')

app.use(express.json())
app.use(cors())
app.use(express.static('dist'))

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

morgan.token('body', (request) => {
  if (request.method === 'POST') {
    return JSON.stringify(request.body)
  } else {
    return null
  }
})
app.use(
  morgan(':method :url :status :res[content-length] - :response-time ms :body')
)

app.post('/api/persons', (request, response, next) => {
  const body = request.body

  if (!body.name) {
    return response.status(400).json({
      error: 'name missing',
    })
  }

  if (!body.number) {
    return response.status(400).json({
      error: 'number missing',
    })
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  })

  person
    .save()
    .then((result) => {
      console.log(result)
      response.json(result)
      // mongoose.connection.close();
    })
    .catch((error) => next(error))
})

app.get('/api/persons', (request, response, next) => {
  Person.find({})
    .then((result) => {
      console.log('phontbook:')
      result.forEach((person) => {
        console.log(`${person.name} ${person.number}`)
      })
      response.json(result)
      // mongoose.connection.close();
    })
    .catch((error) => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then((result) => {
      if (result) {
        response.status(204).end()
      } else {
        response.status(404).json({ error: 'person not found' })
      }
    })
    .catch((error) => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body

  const person = {
    name: body.name,
    number: body.number,
  }

  Person.findByIdAndUpdate(request.params.id, person, { new: true })
    .then((updatedPerson) => {
      response.json(updatedPerson)
    })
    .catch((error) => next(error))
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then((person) => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })

    .catch((error) => next(error))
})

// const generateId = () => {
//   const randomId = Math.floor(Math.random() * 100000);
//   return String(randomId);
// };

// app.post("/api/persons", (request, response) => {
//   const body = request.body;

//   if (!body.name) {
//     return response.status(400).json({
//       error: "name missing",
//     });
//   }

//   if (!body.number) {
//     return response.status(400).json({
//       error: "number missing",
//     });
//   }

//   const name = body.name;
//   if (persons.find((n) => n.name === name)) {
//     return response.status(400).json({
//       error: "name missing",
//     });
//   }

//   const person = {
//     name: body.name,
//     number: body.number,
//     id: generateId(),
//   };

//   persons = persons.concat(person);

//   response.json(person);
// });

// app.get("/api/persons", (request, response) => {
//   response.json(persons);
// });

// const date = new Date();
// app.get("/info", (request, response) => {
//   response.send(`<p>Phonebook has info for ${persons.length} people</p>
//                   <p>${date.toString()}</p>`);
// });

// app.get("/api/persons/:id", (request, response) => {
//   const id = request.params.id;
//   const person = persons.find((p) => p.id === id);
//   if (person) {
//     response.json(person);
//   } else {
//     response.status(404).end();
//   }
// });

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).json({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
