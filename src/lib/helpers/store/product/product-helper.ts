// helper: สร้าง Cloudinary URL จาก publicId (+เวอร์ชัน) สำหรับพรีวิว
export function buildCldUrl(
  publicId: string,
  version?: number,
  trans = "f_auto,q_auto" // จะใส่ c_fill,w_200,h_200 ได้ตามต้องการ
) {
  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
  const v = version ? `v${version}/` : "";
  return `https://res.cloudinary.com/${cloud}/image/upload/${trans}/${v}${publicId}`;
}