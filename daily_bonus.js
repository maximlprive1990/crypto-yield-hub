import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

async function distributeDailyBonus() {
  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("users")
    .select("id, vip_level, vip_expire, daily_bonus_claimed")
    .eq("vip_level", "VIP-1");

  if (error) return console.error(error.message);

  for (const user of data) {
    if (user.vip_expire > new Date().toISOString() && user.daily_bonus_claimed !== today) {
      await supabase
        .from("users")
        .update({
          balance: supabase.raw("balance + 1000"),
          daily_bonus_claimed: today,
        })
        .eq("id", user.id);
      console.log(`Bonus versé à user ${user.id}`);
    }
  }
}

distributeDailyBonus();
