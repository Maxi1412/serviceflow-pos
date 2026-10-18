"""MICROS-informed original order workstation smoke test; no physical printing."""
from pathlib import Path
from playwright.sync_api import sync_playwright, expect
ROOT=Path(__file__).resolve().parent.parent
css=(ROOT/'style.css').read_text(); js=(ROOT/'app.js').read_text()
mock="<script>window.fetch=async()=>new Response('{\"error\":\"standalone\"}',{status:404,headers:{'Content-Type':'application/json'}});</script>"
html='<html><head><meta name="viewport" content="width=device-width, initial-scale=1"><style>'+css+'</style></head><body><div id="app"></div>'+mock+'<script>'+js+'</script></body></html>'
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
 page=browser.new_page(viewport={'width':1440,'height':900});page.set_default_timeout(5500)
 errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.set_content(html,wait_until='domcontentloaded');page.wait_for_timeout(250)
 page.locator('[data-table="m1"]').click();page.locator('[data-action="seat"]').click();page.locator('input[name="covers"]').fill('3');page.locator('[data-form="covers"] button[type="submit"]').click()
 page.locator('[data-action="goto-order"]').click()
 expect(page.get_by_text('GUEST CHECK')).to_be_visible()
 expect(page.locator('.pos-menu-grid [data-product="p4"]')).to_be_visible()
 page.screenshot(path=str(ROOT/'screenshots/screenshot-v05-order-workstation.png'),full_page=True)
 page.locator('[data-seat="2"]').click()
 page.locator('#pos-menu-search').fill('sirloin')
 assert page.locator('#pos-menu-grid [data-product]:visible').count()==1
 page.locator('#pos-menu-search').fill('')
 page.locator('[data-product="p4"]').click()
 expect(page.locator('#item-seat')).to_have_value('2')
 page.locator('[data-option="1:1"]').click()
 page.locator('[data-action="add-item"]').click()
 expect(page.locator('.pos-line')).to_contain_text('Seat 2')
 expect(page.locator('.pos-line')).to_contain_text('Chips instead')
 page.locator('[data-hold-line]').click()
 expect(page.locator('.pos-line')).to_contain_text('HELD')
 assert page.locator('[data-action="send-kitchen"]').is_disabled()
 assert page.locator('[data-action="fire-held"]').is_enabled()
 page.screenshot(path=str(ROOT/'screenshots/screenshot-v05-held-check.png'),full_page=True)
 page.locator('[data-action="fire-held"]').click()
 assert page.locator('[data-action="fire-held"]').is_disabled()
 expect(page.locator('.pos-line')).to_contain_text('SENT')
 page.locator('[data-workspace="manager"]:visible').first.click();page.locator('.sidebar [data-nav="routing"]').click()
 assert page.locator('.job-list').get_by_text('Seat 2').count()>0
 page.locator('.sidebar [data-nav="products"]').click();page.locator('[data-edit-product="p4"]').click()
 assert page.locator('[name="posColor"]').count()==1
 page.locator('[name="posColor"]').select_option('violet')
 page.locator('[name="posPriority"]').fill('1')
 page.locator('[data-form="product"] button[type="submit"]').click()
 page.locator('[data-workspace="service"]:visible').first.click()
 page.locator('[data-table="m1"]').click();page.locator('[data-action="goto-order"]').click()
 assert 'color-violet' in page.locator('[data-product="p4"]').get_attribute('class')
 page.screenshot(path=str(ROOT/'screenshots/screenshot-v05-custom-button.png'),full_page=True)
 assert not errors,errors
 print('PASS: full till layout, seat assignment, menu search, hold/fire routing, manager tile color and priority, no JS errors')
 # inspect mobile layout separately
 mob=browser.new_page(viewport={'width':390,'height':844},is_mobile=True,device_scale_factor=1)
 mob_errors=[];mob.on('pageerror',lambda e:mob_errors.append(str(e)))
 mob.set_content(html,wait_until='domcontentloaded');mob.wait_for_timeout(200)
 mob.locator('[data-table="m1"]').click();mob.locator('[data-action="seat"]').click();mob.locator('[data-form="covers"] button[type="submit"]').click();mob.locator('[data-action="goto-order"]').click()
 expect(mob.locator('.pos-menu-grid')).to_be_visible()
 mob.screenshot(path=str(ROOT/'screenshots/screenshot-v05-mobile-order.png'),full_page=True)
 assert not mob_errors,mob_errors
 browser.close()
