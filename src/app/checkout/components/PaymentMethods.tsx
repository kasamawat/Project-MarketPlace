export default function PaymentMethods() {
  return (
    <div className="border p-4 rounded-lg shadow-sm">
      <h2 className="font-semibold text-lg mb-4">Payment Method</h2>
      <div className="space-y-2">
        <label className="flex items-center gap-2">
          <input type="radio" name="payment" defaultChecked />
          Credit/Debit Card
        </label>
        <label className="flex items-center gap-2">
          <input type="radio" name="payment" />
          PromptPay / QR Code
        </label>
        <label className="flex items-center gap-2">
          <input type="radio" name="payment" />
          COD (เก็บเงินปลายทาง)
        </label>
      </div>
    </div>
  );
}
