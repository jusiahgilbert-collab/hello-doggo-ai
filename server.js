const express = require("express");
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

app.get("/", (req, res) => {
  res.send("Server running");
});

const requestedDate = req.body.date;

let start;
if (requestedDate) {
  start = new Date(requestedDate);
  start.setHours(0, 0, 0, 0);
} else {
  start = new Date();
  start.setHours(0, 0, 0, 0);
}

const end = new Date(start);
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
      console.error("FULL ERROR:", data);
      return res.status(500).json({
        error: "availability failed",
        details: data
      });
    }

    // FORMAT THE TIMES (THIS IS THE IMPORTANT PART)
    const availabilities = data.availabilities || [];

const requestedDate = req.body.date;

let filtered = availabilities;

if (requestedDate) {
  filtered = availabilities.filter(a => {
    const date = new Date(a.start_at);
    const local = new Date(
      date.toLocaleString("en-US", { timeZone: "America/Los_Angeles" })
    );

    const yyyy = local.getFullYear();
    const mm = String(local.getMonth() + 1).padStart(2, "0");
    const dd = String(local.getDate()).padStart(2, "0");

    const formattedDate = `${yyyy}-${mm}-${dd}`;

    return formattedDate === requestedDate;
  });
}

const slots = filtered.map(a => {
  const date = new Date(
    new Date(a.start_at).toLocaleString("en-US", {
      timeZone: "America/Los_Angeles"
    })
  );

  return {
    raw: a.start_at,
    date,
    hour: date.getHours()
  };
});

const morning = slots.filter(s => s.hour < 12);
const afternoon = slots.filter(s => s.hour >= 12 && s.hour < 17);
const evening = slots.filter(s => s.hour >= 17);

const selected = [
  ...morning.slice(0, 2),
  ...afternoon.slice(0, 2),
  ...evening.slice(0, 1)
].slice(0, 5);

const formatted = selected.map(s => ({
  date: s.date.toLocaleDateString([], {
    weekday: "long",
    month: "short",
    day: "numeric"
  }),
  time: s.date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit"
  })
}));
    res.json({ options: formatted });

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
