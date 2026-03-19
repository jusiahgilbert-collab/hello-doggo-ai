const express = require("express");
const cors = require("cors");
require("dotenv").config({ quiet: true });

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3000;

const SQUARE_TOKEN = process.env.SQUARE_TOKEN;
const LOCATION_ID = process.env.SQUARE_LOCATION_ID;
const SERVICE_ID = process.env.SQUARE_SERVICE_VARIATION_ID;
const TEAM_MEMBER_ID = process.env.SQUARE_TEAM_MEMBER_ID;

app.get("/", (req, res) => {
  res.send("Server running");
});

app.post("/checkAvailability", async (req, res) => {
  try {
    const requestedDate = req.body.date;
    const timeOfDay = req.body.timeOfDay;

    console.log("REQUESTED DATE:", requestedDate);
    console.log("FULL BODY:", JSON.stringify(req.body));

    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(end.getDate() + 30);

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

    const response = await fetch(
      "https://connect.squareup.com/v2/bookings/availability/search",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${SQUARE_TOKEN}`,
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Square-Version": "2024-06-04"
        },
        body: JSON.stringify(body)
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({
        error: "availability failed",
        details: data
      });
    }

    const availabilities = data.availabilities || [];
    let filtered = availabilities;

    if (requestedDate) {
      filtered = availabilities.filter((a) => {
        const utc = new Date(a.start_at);
        const local = new Date(
          utc.toLocaleString("en-US", {
            timeZone: "America/Los_Angeles"
          })
        );

        const yyyy = local.getFullYear();
        const mm = String(local.getMonth() + 1).padStart(2, "0");
        const dd = String(local.getDate()).padStart(2, "0");
        const formattedDate = `${yyyy}-${mm}-${dd}`;

        return formattedDate === requestedDate;
      });
    }

    let slots = filtered.map((a) => {
      const date = new Date(
        new Date(a.start_at).toLocaleString("en-US", {
          timeZone: "America/Los_Angeles"
        })
      );

      return {
        raw: a.start_at,
        date,
        dateLabel: date.toLocaleDateString("en-US", {
          weekday: "long",
          month: "short",
          day: "numeric"
        }),
        timeLabel: date.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit"
        })
      };
    });

    slots.sort((a, b) => a.date - b.date);

    if (timeOfDay === "afternoon") {
      slots = slots.filter((slot) => slot.date.getHours() >= 12);
    }

    if (timeOfDay === "morning") {
      slots = slots.filter((slot) => slot.date.getHours() < 12);
    }

    const options = slots.slice(0, 4).map((slot) => ({
      date: slot.dateLabel,
      time: slot.timeLabel
    }));

    res.json({ options });
  } catch (err) {
    console.error("SERVER ERROR:", err);

    res.status(500).json({
      error: "availability failed",
      details: err.message
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
