function StatCard({ title, value, subtitle, color = "blue", icon }) {
    const colorClasses = {
        blue: "bg-blue-50 text-blue-700 border-blue-200",
        green: "bg-green-50 text-green-700 border-green-200",
        yellow: "bg-amber-50 text-amber-700 border-amber-200",
        red: "bg-red-50 text-red-700 border-red-200",
        purple: "bg-purple-50 text-purple-700 border-purple-200",
        indigo: "bg-indigo-50 text-indigo-700 border-indigo-200",
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between hover:border-gray-300 transition">
            <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    {title}
                </span>
                {icon && <span className="text-xl">{icon}</span>}
            </div>

            <div className="mt-2 flex items-baseline justify-between">
                <p className="text-3xl font-extrabold text-gray-900">{value ?? 0}</p>
                {subtitle && (
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${colorClasses[color] || colorClasses.blue}`}>
                        {subtitle}
                    </span>
                )}
            </div>
        </div>
    );
}

export default StatCard;
