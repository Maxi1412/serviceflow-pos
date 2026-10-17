"""Local Chromium smoke test for the standalone demo. Shared multi-terminal API is tested by Node tests."""
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

ROOT=Path(__file__).resolve().parent.parent
css=(ROOT/'style.css').read_text()
js=(ROOT/'app.js').read_text()
mock="<script>window.fetch=async()=>new Response('{\"error\":\"standalone\"}',{status:404,headers:{'Content-Type':'application/json'}});</script>"
html='<html><head><meta name="viewport" content="width=device-width, initial-scale=1"><style>'+css+'</style></head><body><div id="app"></div>'+mock+'<script>'+js+'</script></body></html>'
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
    context=browser.new_context(viewport={'width':1400,'height':980})
    page=context.new_page();page.set_default_timeout(5000)
    errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    page.set_content(html,wait_until='domcontentloaded');page.wait_for_timeout(300)
    page.locator('[data-workspace="manager"]:visible').first.click()
    page.locator('.sidebar [data-nav="products"]').click()
    assert page.locator('#bulk-menu-file').count()==1
    csv='name,price,cost,family,category,subcategory,course,station,icon\nCalamari tapa,8.5,3.3,Food,Starters,Tapas,Starter,cold,🍤\nPremium steak,32,13,Food,Mains,Steaks,Main,hot,🥩\nSoda,3.2,0.45,Beverages,Drinks,Soft drinks,Drinks,bar,🥤\n'
    page.locator('#bulk-menu-file').set_input_files({'name':'menu.csv','mimeType':'text/csv','buffer':csv.encode()})
    expect(page.get_by_text('3 new products',exact=False)).to_be_visible()
    page.screenshot(path=str(ROOT/'screenshot-v03-manager.png'))
    page.get_by_role('button',name='Import 3 products').click()
    assert page.get_by_text('Premium steak').count()>0
    page.locator('.sidebar [data-nav="settings"]').click()
    assert page.get_by_text('Table &amp; area setup').count()>0
    page.locator('[data-form="floor-add"] [name="tableName"]').fill('Patio 9')
    page.locator('[data-form="floor-add"] [name="zone"]').fill('Patio')
    page.locator('[data-form="floor-add"] button[type="submit"]').click()
    page.locator('[data-workspace="service"]:visible').first.click()
    page.locator('[data-zone="Patio"]').click()
    assert page.get_by_text('Patio 9').count()>0
    page.screenshot(path=str(ROOT/'screenshot-v03-waiter.png'))
    page.locator('[data-zone="Main room"]').click()
    page.locator('[data-table="m1"]').click();page.locator('[data-action="seat"]').click()
    page.locator('[name="covers"]').fill('2');page.locator('[data-form="covers"] button[type="submit"]').click()
    page.locator('[data-action="goto-order"]').click();page.locator('[data-category="Mains"]').click()
    assert page.get_by_text('Premium steak').count()>0
    assert page.locator('[data-subcategory="Steaks"]').count()>0
    page.locator('[data-subcategory="Steaks"]').click()
    page.locator('[data-product]').filter(has_text='Premium steak').click()
    page.locator('[data-action="add-item"]').click();page.locator('[data-action="send-kitchen"]').click()
    page.locator('[data-workspace="manager"]:visible').first.click();page.locator('.sidebar [data-nav="routing"]').click()
    assert page.locator('.job-list').get_by_text('Table 1').count()>0
    assert not errors,errors
    print('PASS: CSV preview/import, new table/area, subcategory waiter orders, kitchen routing. JS errors:',errors)
    browser.close()
