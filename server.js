const express = require("express")
const axios = require("axios")
require("dotenv").config()
const cors = require("cors")

const app = express()
app.use(express.json())
app.use(cors())

const SQUARE_TOKEN = process.env.SQUARE_TOKEN

app.post("/searchCustomer", async (req,res)=>{

const phone = req.body.phone

try{

const response = await axios.post(
"https://connect.squareup.com/v2/customers/search",
{
query:{
filter:{
phone_number:{
exact: phone
}
}
}
},
{
headers:{
Authorization: `Bearer ${SQUARE_TOKEN}`,
"Content-Type":"application/json",
"Square-Version":"2024-06-04"
}
}
)

res.json(response.data)

}catch(err){
console.error(err.response?.data || err.message)
res.status(500).json({error:"Square lookup failed"})
}

})
const twilio = require("twilio")

const client = twilio(
process.env.TWILIO_ACCOUNT_SID,
process.env.TWILIO_AUTH_TOKEN
)

app.post("/sendSMS", async (req,res)=>{

const phone = req.body.phone
const message = req.body.message

try{

await client.messages.create({
body: message,
from: "+13503532552",
to: phone
})

res.json({success:true})

}catch(err){

console.error(err)
res.status(500).json({error:"SMS failed"})
}

})const twilio = require("twilio")

const client = twilio(
process.env.TWILIO_ACCOUNT_SID,
process.env.TWILIO_AUTH_TOKEN
)

app.post("/sendSMS", async (req,res)=>{

const phone = req.body.phone
const message = req.body.message

try{

await client.messages.create({
body: message,
from: "+13503532552",
to: phone
})

res.json({success:true})

}catch(err){

console.error(err)
res.status(500).json({error:"SMS failed"})
}

})
app.listen(3000,()=>{
console.log("Server running on port 3000")
})
