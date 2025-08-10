import { ProductVariantBase } from "@/types/product/base/product-base.types";
import Image from "next/image";
import React from "react";
import toast from "react-hot-toast";

type VariantTableProps = {
  variants: ProductVariantBase[];
  productId: string | number;
  parentLevel?: number;
  onSet: (productId: string | number, variant: ProductVariantBase) => void;
  openVariantIds: (string | number)[];
  onToggle: (id: string | number) => void;
  onDelete: (productId: string | number, variantId: string | number) => void;
};

const VariantTable: React.FC<VariantTableProps> = ({
  variants,
  productId,
  parentLevel = 0,
  onSet,
  openVariantIds,
  onToggle,
  onDelete,
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
          <th className="px-4 py-1.5 border border-gray-700 w-1/6">Value</th>
          <th className="px-4 py-1.5 border border-gray-700 w-1/6">Image</th>
          <th className="px-4 py-1.5 border border-gray-700 w-1/6">
            Price (THB)
          </th>
          <th className="px-4 py-1.5 border border-gray-700 w-1/6">Stock</th>
          {/* <th className="px-4 py-1.5 border border-gray-700 w-1/12">Actions</th> */}
        </tr>
      </thead>
      <tbody>
        {variants.map((v) => (
          <React.Fragment key={v._id}>
            <tr
              className={`${
                v.variants && v.variants.length > 0
                  ? "cursor-pointer hover:bg-gray-950"
                  : ""
              } ${
                openVariantIds.includes(v._id as string) ? "bg-gray-900" : ""
              }`}
              onClick={() => {
                if (v.variants && v.variants.length > 0)
                  onToggle(v._id as string);
              }}
            >
              <td className="px-4 py-1.5 border border-gray-700 text-left">
                <div className="flex items-center">
                  {/* Col 1: caret icon (20% width) */}
                  <div className="w-1/5 flex justify-center items-center">
                    {v.variants && v.variants.length > 0 && (
                      <span>
                        {openVariantIds.includes(v._id as string) ? (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="icon icon-tabler icons-tabler-outline icon-tabler-caret-down"
                          >
                            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                            <path d="M6 10l6 6l6 -6h-12" />
                          </svg>
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="icon icon-tabler icons-tabler-outline icon-tabler-caret-right"
                          >
                            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                            <path d="M10 18l6 -6l-6 -6v12" />
                          </svg>
                        )}
                      </span>
                    )}
                  </div>
                  {/* Col 2: value (80%) */}
                  <div className="w-4/5 pl-2 truncate">{v.value}</div>
                </div>
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
                {typeof v.price === "number"
                  ? v.price.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })
                  : ""}
              </td>
              <td className="px-4 py-1.5 border border-gray-700 text-right">
                {typeof v.stock === "number"
                  ? v.stock.toLocaleString("en-US", {
                      minimumFractionDigits: 0,
                    })
                  : ""}
              </td>
              {/* <td
                className="px-4 py-3 border border-gray-700 text-center space-y-1"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className="px-2 py-1 text-cyan-600 hover:text-cyan-700 hover:underline cursor-pointer"
                  onClick={() => onSet(productId, v)}
                >
                  Set
                </button>
                <button
                  className="px-2 py-1 text-red-600 hover:text-red-700 hover:underline cursor-pointer"
                  onClick={() => {
                    if (v._id) onDelete(productId, v._id);
                    else toast.error("ไม่พบ ID ของ variant");
                  }}
                >
                  Delete
                </button>
              </td> */}
            </tr>
            {/* Recursive render subVariant */}
            {v.variants &&
              v.variants.length > 0 &&
              openVariantIds.includes(v._id as string) && (
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
                        onDelete={onDelete}
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
