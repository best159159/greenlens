const SDGSection = () => {
    const sdg = {
        number: 15,
        title: 'Life on Land',
        titleTH: 'ความหลากหลายทางชีวภาพบนบก',
        description: 'โครงการส่งเสริมการฟื้นฟูระบบนิเวศบนบก เพิ่มพื้นที่สีเขียว และปกป้องความหลากหลายทางชีวภาพในพื้นที่เมือง',
        icon: '🌲',
        color: 'from-green-600 to-lime-500',
        impacts: [
            'ฟื้นฟูพื้นที่เสื่อมโทรม',
            'เพิ่มความหลากหลายทางชีวภาพ',
            'ปกป้องระบบนิเวศ',
        ],
    }

    return (
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-50 to-white">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold gradient-text mb-4">
                        SDG Impact
                    </h2>
                    <p className="text-slate-600 text-lg max-w-2xl mx-auto">
                        GreenLens AI สนับสนุนเป้าหมายการพัฒนาที่ยั่งยืนขององค์การสหประชาชาติ
                    </p>
                </div>

                <div className="glass-card rounded-2xl overflow-hidden hover:scale-[1.02] transition-transform duration-300">
                    {/* Header with gradient */}
                    <div className={`bg-gradient-to-r ${sdg.color} p-8 text-white`}>
                        <div className="flex items-start justify-between mb-4">
                            <div className="text-6xl">{sdg.icon}</div>
                            <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                                <div className="text-sm font-medium">SDG</div>
                                <div className="text-3xl font-bold">{sdg.number}</div>
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold mb-2">{sdg.title}</h3>
                        <p className="text-white/90 text-lg">{sdg.titleTH}</p>
                    </div>

                    {/* Content */}
                    <div className="p-8">
                        <p className="text-slate-700 mb-6 leading-relaxed">
                            {sdg.description}
                        </p>

                        <div className="space-y-3">
                            <h4 className="font-semibold text-slate-800 mb-3">
                                ผลกระทบหลัก:
                            </h4>
                            {sdg.impacts.map((impact, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-3 text-slate-700"
                                >
                                    <div className="w-6 h-6 rounded-full bg-eco-green-100 flex items-center justify-center flex-shrink-0">
                                        <svg
                                            className="w-4 h-4 text-eco-green-600"
                                            fill="none"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path d="M5 13l4 4L19 7"></path>
                                        </svg>
                                    </div>
                                    <span>{impact}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Additional Info */}
                <div className="mt-12 text-center">
                    <div className="inline-flex items-center gap-3 bg-white rounded-full px-6 py-3 shadow-md">
                        <div className="text-2xl">🎯</div>
                        <p className="text-slate-700">
                            <span className="font-semibold text-eco-green-600">SDG 15</span> ที่ได้รับผลกระทบโดยตรงจากโครงการ
                        </p>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default SDGSection
