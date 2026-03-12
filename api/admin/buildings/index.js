const { verifyAuth } = require('../../../lib/auth');
const { getAllBuildings, createBuilding } = require('../../../lib/kv');

module.exports = async function handler(req, res) {
  const user = verifyAuth(req);
  if (!user) return res.status(401).json({ error: 'Not authenticated' });

  if (req.method === 'GET') {
    const buildings = await getAllBuildings();
    return res.json(buildings);
  }

  if (req.method === 'POST') {
    try {
      const body = req.body;
      const building = await createBuilding({
        slug: body.slug,
        name: body.name,
        category: body.category,
        building_type: body.building_type,
        width: body.width,
        length: body.length,
        height: body.height,
        roof_style: body.roof_style,
        enclosure: body.enclosure,
        garage_doors: body.garage_doors,
        windows: body.windows,
        walkin_doors: body.walkin_doors,
        concrete: body.concrete,
        certified: body.certified,
        description: body.description || '',
        price: body.price,
        images: body.images || [],
        image: (body.images && body.images[0]) || body.image || '',
        available: body.available
      });
      return res.json({ success: true, id: building.id });
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
};
