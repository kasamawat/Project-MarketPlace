import { ProductVariant } from "@/types/product/base/product-base.types";
import Image from "next/image";
import React from "react";

type VariantTableProps = {
  variants: ProductVariant[];
  productId: string | number;
  parentLevel?: number;
  onSet: (productId: string | number, variant: ProductVariant) => void;
  openVariantIds: (string | number)[];
  onToggle: (id: string | number) => void;
};

const VariantTable: React.FC<VariantTableProps> = ({
  variants,
  productId,
  parentLevel = 0,
  onSet,
  openVariantIds,
  onToggle,
}) => (
  <div>
    <div className="flex font-bold text-lg mt-2 mb-2 text-gray-300">
      <p className="mr-2">Variant Group:</p>
      <p className="text-blue-500">
        {variants.length > 0 ? variants[0].name : ""}
      </p>
    </div>
    <table
      className={`min-w-full text-left bg-gray-800 border border-gray-700`}
    >
      <thead className="bg-gray-600 text-white">
        <tr className="text-center">
          {/* <th className="px-4 py-1.5 border border-gray-700 w-1/6">Group</th> */}
          <th className="px-4 py-1.5 border border-gray-700 w-1/3">Value</th>
          <th className="px-4 py-1.5 border border-gray-700 w-1/6">Image</th>
          <th className="px-4 py-1.5 border border-gray-700 w-1/6">
            Price (THB)
          </th>
          <th className="px-4 py-1.5 border border-gray-700 w-1/6">Stock</th>
          <th className="px-4 py-1.5 border border-gray-700 w-1/6">Actions</th>
        </tr>
      </thead>
      <tbody>
        {variants.map((v) => (
          <React.Fragment key={v.id}>
            <tr
              className={
                v.variants && v.variants.length > 0
                  ? "cursor-pointer hover:bg-gray-900"
                  : ""
              }
              onClick={() => {
                if (v.variants && v.variants.length > 0) onToggle(v.id);
              }}
            >
              {/* <td
                className={`px-4 py-1.5 border border-gray-700 text-left opacity-20`}
                style={{ paddingLeft: parentLevel * 24 }}
              >
                {v.name}
                {v.variants && v.variants.length > 0 && (
                  <span className="ml-2 text-xs">
                    {openVariantIds.includes(v.id) ? "▲" : "▼"}
                  </span>
                )}
              </td> */}
              <td className="px-4 py-1.5 border border-gray-700 text-left">
                {v.value}
                {v.variants && v.variants.length > 0 && (
                  <span className="ml-2 text-xs">
                    {openVariantIds.includes(v.id) ? "▲" : "▼"}
                  </span>
                )}
              </td>
              <td className="px-4 py-1.5 border border-gray-700 text-right">
                {v.image ? (
                  <Image
                    src={v.image}
                    alt={v.name}
                    width={60}
                    height={60}
                    className="h-20 w-20 mx-auto rounded border border-red-700"
                  />
                ) : null}
              </td>
              <td className="px-4 py-1.5 border border-gray-700 text-right">
                {v.price?.toFixed(2) ?? ""}
              </td>
              <td className="px-4 py-1.5 border border-gray-700 text-right">
                {v.stock ?? ""}
              </td>
              <td className="px-4 py-3 border border-gray-700 text-center space-y-1">
                {/* ปุ่ม action อื่นๆ */}
                <button
                  className="px-2 py-1 text-cyan-600 hover:text-cyan-700 hover:underline cursor-pointer"
                  onClick={() => onSet(productId, v)}
                >
                  Set
                </button>
              </td>
            </tr>
            {/* Recursive render subVariant */}
            {v.variants &&
              v.variants.length > 0 &&
              openVariantIds.includes(v.id) && (
                <tr>
                  <td colSpan={6} className="p-0 border-none">
                    <div className="ml-4 mb-4">
                      <VariantTable
                        variants={v.variants}
                        productId={productId}
                        parentLevel={parentLevel + 1}
                        onSet={onSet}
                        openVariantIds={openVariantIds}
                        onToggle={onToggle}
                      />
                    </div>
                  </td>
                </tr>
              )}
          </React.Fragment>
        ))}
      </tbody>
    </table>
  </div>
);

export default VariantTable;
