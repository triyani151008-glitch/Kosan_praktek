import React from 'react';

const DurationStep = ({ room, onSelect, selectedDuration, type }) => {
  // FITUR: Auto-Parsing jika data datang dalam bentuk string
  let pricingData = room?.pricing_plan;
  if (typeof pricingData === 'string') {
    try {
      pricingData = JSON.parse(pricingData);
    } catch (e) {
      pricingData = { hourly: {}, monthly: {} };
    }
  }

  const parsedPlan = pricingData || { hourly: {}, monthly: {} };

  const getplans = (currentType) => {
    // SINKRONISASI: Gunakan 'monthly'
    const source_plans = currentType === 'monthly' ? parsedPlan.monthly : parsedPlan.hourly;
    
    if (!source_plans) return [];

    return Object.entries(source_plans)
      .map(([key, val]) => ({ id: key, ...val }))
      // FILTER: Hanya tampilkan yang harganya > 0 dan status 'active'
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
      <h3 className="text-lg font-semibold text-gray-800">Pilih Durasi Sewa</h3>
      <div className="grid grid-cols-1 gap-3">
        {plans.length > 0 ? (
          plans.map((plan) => (
            <button
              key={plan.id}
              onClick={() => onSelect(plan)}
              className={`p-5 border-2 rounded-3xl flex justify-between items-center transition-all ${
                selectedDuration?.id === plan.id
                  ? 'border-black bg-black text-white shadow-xl'
                  : 'border-gray-50 bg-white hover:border-gray-200'
              }`}
            >
              <div className="flex flex-col items-start text-left">
                <span className={`text-[10px] font-black ${selectedDuration?.id === plan.id ? 'text-gray-400' : 'text-gray-400'}`}>DURASI</span>
                <span className="text-lg font-bold">{plan.label}</span>
              </div>
              <div className="text-right">
                <span className="text-xl font-black">Rp {plan.price.toLocaleString('id-ID')}</span>
              </div>
            </button>
          ))
        ) : (
          <div className="p-12 text-center border-2 border-dashed border-gray-100 rounded-[2.5rem] bg-gray-50/50">
            <p className="text-gray-400 text-sm font-bold uppercase tracking-widest leading-relaxed">
              Mitra belum mengaktifkan <br/> tarif untuk kategori ini.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DurationStep;
