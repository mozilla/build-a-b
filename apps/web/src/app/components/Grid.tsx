import React from "react";

export default function Grid({
  slot1, slot2, slot3, slot4, slot5, slot6, slot7, slot8, slot9, slot10, slot11
}: {
  slot1?: React.ReactNode;
  slot2?: React.ReactNode;
  slot3?: React.ReactNode;
  slot4?: React.ReactNode;
  slot5?: React.ReactNode;
  slot6?: React.ReactNode;
  slot7?: React.ReactNode;
  slot8?: React.ReactNode;
  slot9?: React.ReactNode;
  slot10?: React.ReactNode;
  slot11?: React.ReactNode;
}) {
  const baseClasses = "";

  return (
    <div className="grid grid-cols-12 grid-rows-6 gap-4">
      <div className={`col-span-7 row-span-2 ${baseClasses}`}>{ slot1 }</div>
      <div className={`col-span-5 row-span-3 col-start-8 ${baseClasses}`}>{ slot2 }</div>
      <div className={`col-span-7 row-start-3 ${baseClasses}`}>{ slot3 }</div>
      <div className={`col-span-4 row-start-4 ${baseClasses}`}>{ slot4 }</div>
      <div className={`col-span-4 row-span-2 col-start-5 row-start-4 ${baseClasses}`}>{ slot5 }</div>
      <div className={`col-span-4 row-span-2 col-start-9 row-start-4 ${baseClasses}`}>{ slot6 }</div>
      <div className={`col-span-4 row-span-2 row-start-5 ${baseClasses}`}>{ slot7 }</div>
      <div className={`col-span-2 col-start-5 row-start-6 ${baseClasses}`}>{ slot8 }</div>
      <div className={`col-span-2 col-start-7 row-start-6 ${baseClasses}`}>{ slot9 }</div>
      <div className={`col-span-2 col-start-9 row-start-6 ${baseClasses}`}>{ slot10 }</div>
      <div className={`col-span-2 col-start-11 row-start-6 ${baseClasses}`}>{ slot11 }</div>
    </div>
  );
}