from playwright.sync_api import sync_playwright
from pathlib import Path
root=Path(__file__).resolve().parent.parent
css=(root/'style.css').read_text()
js=(root/'app.js').read_text()
mock='''<script>window.fetch=async()=>new Response('{"error":"standalone"}',{status:404,headers:{'Content-Type':'application/json'}});</script>'''
html='<html><head><meta name="viewport" content="width=device-width, initial-scale=1"><style>'+css+'</style></head><body><div id="app"></div>'+mock+'<script>'+js+'</script></body></html>'
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
    context=browser.new_context(viewport={'width':1440,'height':1000})
    page=context.new_page();page.set_default_timeout(4500)
    errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    page.set_content(html,wait_until='domcontentloaded');page.wait_for_timeout(300)
    print('initial',page.locator('h2').first.inner_text())
    page.screenshot(path=str(root/'screenshot-v02-waiter.png'))
    page.locator('.sidebar [data-workspace="manager"]').click();page.locator('.sidebar [data-nav="products"]').click()
    print('edit form cost',page.locator('input[name="cost"]').count(),'route',page.locator('select[name="stationId"]').count())
    page.screenshot(path=str(root/'screenshot-v02-manager.png'))
    page.locator('.sidebar [data-nav="routing"]').click();page.screenshot(path=str(root/'screenshot-v02-routing.png'))
    page.locator('.sidebar [data-workspace="kitchen"]').click()
    print('kitchen headings',page.locator('h2').first.inner_text())
    page.screenshot(path=str(root/'screenshot-v02-kitchen.png'))
    page.locator('.sidebar [data-workspace="service"]').click();page.locator('[data-table="m1"]').click();page.locator('[data-action="seat"]').click();page.locator('input[name="covers"]').fill('3');page.locator('[data-form="covers"] button[type="submit"]').click()
    page.locator('[data-action="goto-order"]').click();page.locator('[data-product="p4"]').click();page.locator('[data-option="1:1"]').click();page.locator('[data-option="2:0"]').click();page.locator('#item-notes').fill('No onions');page.locator('[data-action="add-item"]').click()
    page.locator('[data-action="send-kitchen"]').click();page.locator('.sidebar [data-workspace="manager"]').click();page.locator('.sidebar [data-nav="routing"]').click()
    print('local ticket queued',page.locator('.job-list').get_by_text('Table 1',exact=False).count())
    assert page.locator('.job-list').get_by_text('Table 1',exact=False).count()==1
    assert not errors,errors
    print('page errors',errors)
    browser.close()
