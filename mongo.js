const mongoose = require("mongoose");

if (process.argv.length < 3) {
  console.log("give password as argument");
  process.exit(1);
}

const password = process.argv[2];

const url = `mongodb+srv://hz326715:${password}@cluster0.ufv8v.mongodb.net/personApp?retryWrites=true&w=majority&appName=Cluster0`;

mongoose.set("strictQuery", false);

mongoose.connect(url);

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
});

const Person = mongoose.model("Person", personSchema);

if (process.argv.length === 5) {
  const newPersonName = process.argv[3];
  const newPersonNumber = process.argv[4];
  const person = new Person({
    name: newPersonName,
    number: newPersonNumber,
  });

  person.save().then((result) => {
    console.log(result);
    mongoose.connection.close();
  });
} else if (process.argv.length === 3) {
  Person.find({}).then((result) => {
    console.log("phontbook:");
    result.forEach((person) => {
      console.log(`${person.name} ${person.number}`);
    });
    mongoose.connection.close();
  });
}
