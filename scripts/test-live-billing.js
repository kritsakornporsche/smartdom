(async () => {
  try {
    const res = await fetch('http://kritsakorn.thddns.net:5993/api/tenant/billing/list?email=' + encodeURIComponent('kritsakorn8011@gmail.com'));
    const data = await res.json();
    console.log('API Response for kritsakorn8011@gmail.com:');
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Fetch error:', err.message);
  }
})();
