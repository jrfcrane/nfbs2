const { getAllBuildings } = require('../lib/kv');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const allBuildings = await getAllBuildings();
    const category = req.query.category || null;

    let available = allBuildings
      .filter(b => b.available)
      .sort((a, b) => (a.price || 0) - (b.price || 0));

    if (category) {
      available = available.filter(b => b.category === category);
    }

    const buildings = available.map(b => ({
      id: b.id,
      slug: b.slug,
      name: b.name,
      category: b.category,
      building_type: b.building_type,
      width: b.width,
      length: b.length,
      height: b.height,
      roof_style: b.roof_style,
      enclosure: b.enclosure,
      garage_doors: b.garage_doors,
      windows: b.windows,
      walkin_doors: b.walkin_doors,
      concrete: b.concrete,
      certified: b.certified,
      description: b.description,
      price: b.price,
      image: (b.images && b.images[0]) || b.image || '',
      images: b.images || (b.image ? [b.image] : []),
      available: true
    }));

    res.json({ buildings });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load buildings.' });
  }
};
