// Turns due recurring templates (rent, subscriptions, salary) into real
// transaction rows. There's no server-side cron here, so this runs lazily:
// called once whenever the app fetches transactions, it catches up on
// whatever occurrences have come due since the user's last visit.
const MAX_OCCURRENCES_PER_RUN = 60;

function toISODate(date) {
  return date.toISOString().slice(0, 10);
}

function addInterval(date, frequency) {
  const next = new Date(date);
  if (frequency === "weekly") {
    next.setDate(next.getDate() + 7);
  } else if (frequency === "yearly") {
    next.setFullYear(next.getFullYear() + 1);
  } else {
    // Monthly: clamp to the target month's last day (e.g. Jan 31 -> Feb 28/29).
    const targetDay = next.getDate();
    next.setDate(1);
    next.setMonth(next.getMonth() + 1);
    const daysInTargetMonth = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate();
    next.setDate(Math.min(targetDay, daysInTargetMonth));
  }
  return next;
}

function occurrencesDue(template, today) {
  const dates = [];
  let cursor = template.last_generated_date
    ? addInterval(new Date(template.last_generated_date), template.frequency)
    : new Date(template.start_date);

  while (cursor <= today && dates.length < MAX_OCCURRENCES_PER_RUN) {
    dates.push(new Date(cursor));
    cursor = addInterval(cursor, template.frequency);
  }

  return dates;
}

export async function generateDueTransactions(supabase, userId) {
  const { data: templates, error } = await supabase
    .from("recurring_transactions")
    .select("*")
    .eq("user_id", userId)
    .eq("active", true);

  if (error || !templates?.length) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const rowsToInsert = [];
  const templateUpdates = [];

  for (const template of templates) {
    const dueDates = occurrencesDue(template, today);
    if (dueDates.length === 0) continue;

    for (const date of dueDates) {
      rowsToInsert.push({
        user_id: userId,
        name: template.name,
        amount: template.amount,
        type: template.type,
        category: template.category,
        date: toISODate(date),
      });
    }

    templateUpdates.push({
      id: template.id,
      last_generated_date: toISODate(dueDates[dueDates.length - 1]),
    });
  }

  if (rowsToInsert.length === 0) return;

  await supabase.from("transactions").insert(rowsToInsert);

  await Promise.all(
    templateUpdates.map(({ id, last_generated_date }) =>
      supabase.from("recurring_transactions").update({ last_generated_date }).eq("id", id)
    )
  );
}
