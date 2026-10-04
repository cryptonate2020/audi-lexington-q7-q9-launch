// Point this at the URL that should receive RSVP JSON.
// Leave it as an empty string until that URL is ready.
// While it is empty, the page does not pretend a request was saved.
//
// The page POSTs:
// {
//   fullName: string,
//   email: string,
//   phone: string,
//   guests: number, // includes the person submitting
//   note: string,
//   event: string,
//   when: string,
//   where: string
// }
window.RSVP_ENDPOINT = "";
