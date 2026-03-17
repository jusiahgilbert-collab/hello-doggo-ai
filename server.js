const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3000;

const SQUARE_TOKEN = process.env.SQUARE_TOKEN;
const LOCATION_ID = process.env.SQUARE_LOCATION_ID;
const SERVICE_ID = process.env.SQUARE_SERVICE_VARIATION_ID;
const TEAM_MEMBER_ID = process.env.SQUARE_TEAM_MEMBER_ID;

const headers = {
  Authorization: `Bearer ${SQUARE_TOKEN}`,
  "Content-Type": "application/json",
  "Square-Version": "2024-06-04"
};

app.get("/", (req, res) => {
  res.send("Server running");
});

app.post("/checkAvailability", async (req, res) => {
  try {
    const start = new Date();
    const end = new Date();
    end.setDate(start.getDate() + 7);

    const body = {
      query: {
        filter: {
          location_id: LOCATION_ID,
          start_at_range: {
            start_at: start.toISOString(),
            end_at: end.toISOString()
          },
          segment_filters: [
            {
              service_variation_id: SERVICE_ID,
              team_member_id_filter: {
                any: [TEAM_MEMBER_ID]
              }
            }
          ]
        }
      }
    };

    const response = await axios.post(
      "https://connect.squareup.com/v2/bookings/availability/search",
      body,
      { headers }
    );

    res.json(response.data);

  } catch (err) {
    console.error("FULL ERROR:", JSON.stringify(err.response?.data, null, 2));

    res.status(500).json({
      error: "availability failed",
      details: err.response?.data || err.message
    });
  }
});

app.post("/sendSMS", async (req, res) => {
  console.log("SMS requested:", req.body);
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Running on port ${PORT}`);
});
