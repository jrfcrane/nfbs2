const { verifyAuth } = require('../../../lib/auth');
const { getBuildingById, updateBuilding, deleteBuilding } = require('../../../lib/kv');

module.exports = async function handler(req, res) {
  const user = verifyAuth(req);
  if (!user) return res.status(401).json({ error: 'Not authenticated' });

  const { id } = req.query;

  if (req.method === 'GET') {
    const building = await getBuildingById(id);
    if (!building) return res.status(404).json({ error: 'Building not found' });
    return res.json(building);
  }

  if (req.method === 'PUT') {
    try {
      const body = req.body;
      const building = await updateBuilding(id, {
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
        description: body.description,
        price: body.price,
        images: body.images || [],
        image: (body.images && body.images[0]) || body.image || '',
        available: body.available
      });
      if (!building) return res.status(404).json({ error: 'Building not found' });
      return res.json({ success: true });
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const deleted = await deleteBuilding(id);
      if (!deleted) return res.status(404).json({ error: 'Building not found' });
      return res.json({ success: true });
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
};
