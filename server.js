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
Authorization:`Bearer ${SQUARE_TOKEN}`,
"Content-Type":"application/json"
}
}
)

res.json(response.data)

}catch(err){
res.status(500).json({error:err.message})
}

})

app.listen(3000,()=>{
console.log("Server running on port 3000")
})

