// Placeholder until F2 replaces this with the restaurant discovery page.
// Needed now so "/" resolves to something inside the (customer) route
// group's layout — TC-1.1 and friends check the header after redirecting
// here, and an entirely unmatched route renders the root layout only.
export default function HomePage() {
  return <p>Restaurant discovery is coming soon.</p>;
}
