import React from 'react';

const DurationStep = ({ room, onSelect, selectedDuration, type }) => {
  // SINKRONISASI: Ambil data dari pricing_plan database
  const parsedPlan = room?.pricing_plan || { hourly: {}, monthly: {} };

  const getplans = (currentType) => {
    // SINKRONISASI KUNCI: Gunakan 'monthly' bukan 'daily'
    const source_plans = currentType === 'monthly' ? parsedPlan.monthly : parsedPlan.hourly;
    
    if (!source_plans) return [];

    return Object.entries(source_plans)
      .map(([key, val]) => ({
        id: key,
        ...val
      }))
      // FILTER: Hanya tampilkan tarif yang statusnya AKTIF dan harganya valid
      .filter(opt => opt.active === true && Number(opt.price) > 0)
      .map(opt => ({
        id: opt.id,
        label: currentType === 'hourly' ? `${opt.id} Jam` : `${opt.id} Bulan`,
        price: Number(opt.price),
        type: currentType === 'hourly' ? 'hour' : 'month'
      }))
      .sort((a, b) => Number(a.id) - Number(b.id));
  };

  const plans = getplans(type);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800 px-1">Pilih Durasi Sewa</h3>
      <div className="grid grid-cols-1 gap-3">
        {plans.length > 0 ? (
          plans.map((plan) => (
            <button
              key={plan.id}
              onClick={() => onSelect(plan)}
              className={`p-4 border-2 rounded-2xl flex justify-between items-center transition-all ${
                selectedDuration?.id === plan.id
                  ? 'border-black bg-black text-white shadow-md'
                  : 'border-gray-100 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex flex-col items-start text-left">
                <span className={`text-[10px] font-bold ${selectedDuration?.id === plan.id ? 'text-gray-300' : 'text-gray-400'}`}>DURASI</span>
                <span className="text-lg font-bold">{plan.label}</span>
              </div>
              <div className="text-right">
                <span className="text-lg font-black">Rp {plan.price.toLocaleString('id-ID')}</span>
              </div>
            </button>
          ))
        ) : (
          <div className="p-10 text-center border-2 border-dashed border-gray-100 rounded-3xl bg-gray-50/50">
            <p className="text-gray-500 text-sm font-medium">Mitra belum mengaktifkan tarif untuk unit ini.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DurationStep;
