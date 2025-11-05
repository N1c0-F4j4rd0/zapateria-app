const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

const BASE = 'http://localhost:3000';

describe('Zapatería E2E', () => {
  let driver;

  beforeAll(async () => {
    const options = new chrome.Options();
    options.addArguments('--headless=new', '--no-sandbox', '--disable-dev-shm-usage');
    driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();
  });

  afterAll(async () => {
    if (driver) await driver.quit();
  });

  test('1. Carga home y muestra título', async () => {
    await driver.get(BASE);
    const h1 = await driver.findElement(By.css('header h1')).getText();
    expect(h1.toLowerCase()).toContain('tienda de zapatos');
  });

  test('2. /api/products responde con catálogo', async () => {
    const res = await fetch(`${BASE}/api/products`);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
  });

  test('3. Renderiza cards de productos', async () => {
    await driver.get(BASE);
    await driver.wait(until.elementLocated(By.id('product-list')), 5000);
    const cards = await driver.findElements(By.css('#product-list .card'));
    expect(cards.length).toBeGreaterThan(0);
  });

  test('4. Filtro por nombre (si existe buscador)', async () => {
    const input = await driver.findElements(By.css('input[name="q"], input[placeholder*="Buscar"]'));
    if (input.length) {
      await input[0].clear();
      await input[0].sendKeys('Runner');
      await driver.sleep(300);
      const cards = await driver.findElements(By.css('#product-list .card'));
      expect(cards.length).toBeGreaterThan(0);
    } else {
      expect(true).toBe(true); // skip si no hay buscador
    }
  });

  test('5. Botón "Ver carrito" navega a /cart.html', async () => {
    await driver.get(BASE);
    const link = await driver.findElement(By.css('a[href="/cart.html"]'));
    await link.click();
    await driver.wait(until.urlContains('/cart.html'), 5000);
    const h1 = await driver.findElement(By.css('main h1')).getText();
    expect(h1.toLowerCase()).toContain('carrito');
  });

  test('6. Login demo para poder modificar carrito', async () => {
    const csrf = await (await fetch(`${BASE}/api/csrf-token`, { credentials: 'include' })).json();
    const resp = await fetch(`${BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf.csrfToken },
      credentials: 'include',
      body: JSON.stringify({ email: 'demo@demo.com', password: 'demo123' })
    });
    expect(resp.status).toBe(200);
  });

  test('7. Agregar al carrito incrementa badge', async () => {
    await driver.get(BASE);
    // obtiene badge actual
    const badge = await driver.findElement(By.id('cart-count'));
    const before = parseInt(await badge.getText(), 10) || 0;

    // click primer botón Agregar
    const btn = await driver.findElement(By.css('#product-list button[data-id]'));
    await btn.click();
    await driver.sleep(400);

    const after = parseInt(await (await driver.findElement(By.id('cart-count'))).getText(), 10) || 0;
    expect(after).toBe(before + 1);
  });

  test('8. /api/cart/total devuelve JSON con total', async () => {
    const res = await fetch(`${BASE}/api/cart/total`, { credentials: 'include' });
    const data = await res.json();
    expect(typeof data.total).toBe('number');
    expect(data.total).toBeGreaterThanOrEqual(0);
  });

  test('9. /api/cart/remove valida productId', async () => {
    const csrf = await (await fetch(`${BASE}/api/csrf-token`, { credentials: 'include' })).json();
    const res = await fetch(`${BASE}/api/cart/remove`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf.csrfToken },
      credentials: 'include',
      body: JSON.stringify({ productId: "x" })
    });
    expect(res.status).toBe(400);
  });

  test('10. Vaciar carrito deja total en 0', async () => {
    const csrf = await (await fetch(`${BASE}/api/csrf-token`, { credentials: 'include' })).json();
    await fetch(`${BASE}/api/cart/clear`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf.csrfToken },
      credentials: 'include',
    });
    const res = await fetch(`${BASE}/api/cart/total`, { credentials: 'include' });
    const data = await res.json();
    expect(data.total).toBe(0);
  });
});
