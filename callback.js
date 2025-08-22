import express from "express";
import { createClient } from "@supabase/supabase-js";

const app = express();
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

app.post("/callback", async (req, res) => {
  const { user_id, amount, status, signature } = req.body;
  // TODO : vérifier la signature/authenticité

  if (status !== "success" || amount < 10) {
    return res.status(400).send("Paiement invalide ou montant insuffisant");
  }

  const expiration = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  const { error } = await supabase
    .from("users")
    .update({ vip_level: "VIP-1", vip_expire: expiration })
    .eq("id", user_id);

  if (error) return res.status(500).send(error.message);

  res.send(`VIP-1 activé pour l'utilisateur ${user_id} jusqu'à ${expiration}`);
});

app.listen(3000, () => console.log("Callback server listening on port 3000"));
