const { getAllBuildings, getAllSheds } = require('../lib/kv');

module.exports = async function handler(req, res) {
  const { type, slug } = req.query;

  if (!type || !slug) {
    return res.redirect(302, '/');
  }

  try {
    let title, description, image, pageUrl;
    const domain = 'https://www.northfloridabuildingsolutions.com';

    if (type === 'building') {
      const buildings = await getAllBuildings();
      const b = buildings.find(x => x.slug === slug && x.available);
      if (!b) return res.redirect(302, domain + '/steel-buildings.html');

      title = b.name + ' - $' + (b.price || 0).toLocaleString('en-US');
      description = b.width + "' x " + b.length + "' x " + b.height + "' | Free Delivery & Installation | North Florida Building Solutions";
      image = (b.images && b.images[0]) || b.image || '';
      pageUrl = domain + '/steel-buildings.html';
    } else if (type === 'shed') {
      const sheds = await getAllSheds();
      const s = sheds.find(x => x.slug === slug && x.available);
      if (!s) return res.redirect(302, domain + '/sheds-for-sale.html');

      title = s.name + ' - $' + (s.sale_price || 0).toLocaleString('en-US');
      description = (s.size || '') + ' | Free Delivery & Setup | North Florida Building Solutions';
      image = (s.images && s.images[0]) || s.image || '';
      pageUrl = domain + '/sheds-for-sale.html';
    } else {
      return res.redirect(302, '/');
    }

    // Make image absolute
    if (image && !image.startsWith('http')) {
      image = domain + (image.startsWith('/') ? '' : '/') + image;
    }

    var html = '<!DOCTYPE html><html><head>' +
      '<meta charset="UTF-8">' +
      '<meta property="og:type" content="product">' +
      '<meta property="og:title" content="' + escHtml(title) + '">' +
      '<meta property="og:description" content="' + escHtml(description) + '">' +
      (image ? '<meta property="og:image" content="' + escHtml(image) + '">' : '') +
      '<meta property="og:url" content="' + escHtml(pageUrl) + '">' +
      '<meta property="og:site_name" content="North Florida Building Solutions">' +
      '<meta name="twitter:card" content="summary_large_image">' +
      '<meta http-equiv="refresh" content="0;url=' + escHtml(pageUrl) + '">' +
      '<title>' + escHtml(title) + '</title>' +
      '</head><body>' +
      '<p>Redirecting to <a href="' + escHtml(pageUrl) + '">North Florida Building Solutions</a>...</p>' +
      '</body></html>';

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=300');
    res.status(200).send(html);
  } catch (err) {
    res.redirect(302, '/');
  }
};

function escHtml(str) {
  return String(str).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
