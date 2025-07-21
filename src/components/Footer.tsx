import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900/90 text-gray-300 py-10 mt-20">
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-3 gap-8">
        {/* Section 1: โลโก้ / รายละเอียดร้าน */}
        <div>
          <h2 className="text-xl font-bold text-white mb-2">MyShop</h2>
          <p className="text-sm">
            ร้านค้าออนไลน์สำหรับสินค้าหลากหลายคุณภาพ
          </p>
        </div>

        {/* Section 2: เมนูลิงก์ */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">เมนู</h3>
          <ul className="space-y-2">
            <li><Link href="/" className="hover:underline">หน้าแรก</Link></li>
            <li><Link href="/products" className="hover:underline">สินค้า</Link></li>
            <li><Link href="/about" className="hover:underline">เกี่ยวกับเรา</Link></li>
            <li><Link href="/contact" className="hover:underline">ติดต่อเรา</Link></li>
          </ul>
        </div>

        {/* Section 3: ข้อมูลติดต่อ */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">ติดต่อเรา</h3>
          <ul className="space-y-2 text-sm">
            <li>📍 123/45 ซอยบางรัก กรุงเทพฯ</li>
            <li>📞 081-234-5678</li>
            <li>📧 myshop@email.com</li>
            <li className="flex space-x-3 mt-2">
              <a href="#" className="hover:text-white">Facebook</a>
              <a href="#" className="hover:text-white">Instagram</a>
            </li>
          </ul>
        </div>
      </div>

      <div className="text-center text-sm text-gray-500 mt-10">
        &copy; {new Date().getFullYear()} MyShop. สงวนลิขสิทธิ์.
      </div>
    </footer>
  );
}
