import React from 'react';

const DurationStep = ({ room, onSelect, selectedDuration, type }) => {
  // 1. Parsing data pricing_plan dari database
  // Pastikan jika data kosong, aplikasi tidak crash dengan memberikan default object
  const parsedPlan = room?.pricing_plan || { hourly: {}, monthly: {} };

  const getplans = (currentType) => {
    // 2. Sinkronisasi: Gunakan 'monthly' untuk tab bulanan
    const source_plans = currentType === 'monthly' ? parsedPlan.monthly : parsedPlan.hourly;
    
    if (!source_plans) return [];

    // 3. Transformasi objek JSON menjadi Array untuk ditampilkan
    return Object.entries(source_plans)
      .map(([key, val]) => ({
        id: key,
        ...val
      }))
      // 4. Filter Sinkron: Hanya tampilkan yang status 'active' nya TRUE di dashboard
      .filter(opt => opt.active === true && Number(opt.price) > 0)
      .map(opt => ({
        id: opt.id,
        label: currentType === 'hourly' ? `${opt.id} Jam` : `${opt.id} Bulan`,
        price: Number(opt.price),
        type: currentType === 'hourly' ? 'hour' : 'month'
      }))
      // Urutkan durasi dari yang terkecil (1 jam, 2 jam, dst)
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
              className={`p-4 border-2 rounded-2xl flex justify-between items-center transition-all duration-200 ${
                selectedDuration?.id === plan.id
                  ? 'border-black bg-black text-white shadow-md'
                  : 'border-gray-100 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex flex-col items-start">
                <span className={`text-sm font-bold ${selectedDuration?.id === plan.id ? 'text-gray-300' : 'text-gray-500'}`}>
                  DURASI
                </span>
                <span className="text-lg font-bold">{plan.label}</span>
              </div>
              
              <div className="text-right">
                <span className="text-lg font-black">
                  Rp {plan.price.toLocaleString('id-ID')}
                </span>
              </div>
            </button>
          ))
        ) : (
          // Empty State jika mitra belum mengatur harga
          <div className="p-10 text-center border-2 border-dashed border-gray-100 rounded-3xl bg-gray-50/50">
            <div className="mb-2 text-2xl">⏳</div>
            <p className="text-gray-500 text-sm font-medium leading-relaxed">
              Mitra belum mengaktifkan tarif <br /> 
              <span className="font-bold text-black uppercase">{type === 'hourly' ? 'Transit' : 'Bulanan'}</span> untuk unit ini.
            </p>
          </div>
        )}
      </div>

      {/* Info tambahan untuk User */}
      {plans.length > 0 && (
        <p className="text-[10px] text-gray-400 text-center mt-4 uppercase tracking-widest font-bold">
          Harga sudah termasuk biaya layanan & PPN
        </p>
      )}
    </div>
  );
};

export default DurationStep;
