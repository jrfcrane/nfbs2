const { getAllBuildings } = require('../../../lib/kv');

module.exports = async function handler(req, res) {
  var slug = req.query.slug;
  var domain = 'https://www.northfloridabuildingsolutions.com';
  var pageUrl = domain + '/steel-buildings.html';

  try {
    var buildings = await getAllBuildings();
    var b = buildings.find(function(x) { return x.slug === slug && x.available; });

    if (!b) {
      return res.redirect(302, pageUrl);
    }

    var title = b.name + ' - $' + (b.price || 0).toLocaleString('en-US');
    var description = b.width + "' x " + b.length + "' x " + b.height + "' | Free Delivery & Installation | North Florida Building Solutions | Call (386) 350-1047";
    var image = (b.images && b.images[0]) || b.image || '';

    if (image && !image.startsWith('http')) {
      image = domain + (image.startsWith('/') ? '' : '/') + image;
    }

    var html = '<!DOCTYPE html>\n<html>\n<head>\n' +
      '<meta charset="UTF-8">\n' +
      '<meta property="og:type" content="product">\n' +
      '<meta property="og:title" content="' + esc(title) + '">\n' +
      '<meta property="og:description" content="' + esc(description) + '">\n' +
      (image ? '<meta property="og:image" content="' + esc(image) + '">\n<meta property="og:image:width" content="1200">\n<meta property="og:image:height" content="630">\n' : '') +
      '<meta property="og:url" content="' + esc(domain + '/share/building/' + slug) + '">\n' +
      '<meta property="og:site_name" content="North Florida Building Solutions">\n' +
      '<meta name="twitter:card" content="summary_large_image">\n' +
      '<meta name="twitter:title" content="' + esc(title) + '">\n' +
      '<meta name="twitter:description" content="' + esc(description) + '">\n' +
      (image ? '<meta name="twitter:image" content="' + esc(image) + '">\n' : '') +
      '<title>' + esc(title) + '</title>\n' +
      '</head>\n<body>\n' +
      '<script>window.location.href="' + esc(pageUrl) + '";</script>\n' +
      '<p>Redirecting... <a href="' + esc(pageUrl) + '">Click here</a> if not redirected.</p>\n' +
      '</body>\n</html>';

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=300, max-age=300');
    res.status(200).send(html);
  } catch (err) {
    res.redirect(302, pageUrl);
  }
};

function esc(str) {
  return String(str).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
