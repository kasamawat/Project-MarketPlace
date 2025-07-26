export default function ShippingForm() {
  return (
    <div className="border p-4 rounded-lg shadow-sm">
      <h2 className="font-semibold text-lg mb-4">Shipping Information</h2>
      <form className="space-y-3">
        <input className="w-full border p-2" placeholder="Full Name" />
        <input className="w-full border p-2" placeholder="Phone Number" />
        <input className="w-full border p-2" placeholder="Address" />
        <input className="w-full border p-2" placeholder="City" />
        <input className="w-full border p-2" placeholder="Postal Code" />
      </form>
    </div>
  );
}
