from pathlib import Path
from playwright.sync_api import sync_playwright
p=Path(__file__).resolve().parents[1]
with sync_playwright() as pl:
    browser=pl.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
    page=browser.new_page(viewport={'width':430,'height':920},device_scale_factor=1)
    errors=[];page.on('pageerror', lambda e: errors.append(str(e)))
    page.set_content((p/'demo-web.html').read_text(),wait_until='load')
    page.wait_for_timeout(400)
    assert page.get_by_text('O serviço certo.').count()==1
    page.screenshot(path=str(p/'previews/home-navy.png'))
    page.get_by_role('button',name='Explorar',exact=True).click()
    page.wait_for_timeout(400)
    assert page.get_by_text('18 resultados').count()==1
    page.screenshot(path=str(p/'previews/explore-navy.png'))
    page.get_by_role('button',name='UBS Sé').first.click() if page.get_by_role('button',name='UBS Sé').count() else page.locator('.unit').first.click()
    page.wait_for_timeout(400)
    assert 'UBS Sé' in page.locator('#screen').inner_text()
    page.screenshot(path=str(p/'previews/detail-navy.png'))
    page.get_by_role('button',name='Organizar meu atendimento').click()
    assert page.get_by_text('Organizar atendimento').count()>0
    page.locator('#jtitle').fill('Consulta de exemplo')
    page.get_by_role('button',name='Salvar na Minha Jornada').click()
    page.wait_for_timeout(350)
    assert page.get_by_text('Consulta de exemplo').count()>=1
    page.screenshot(path=str(p/'previews/journey-navy.png'))
    page.get_by_role('button',name='Experiências').click()
    page.wait_for_timeout(350)
    page.get_by_role('button',name='Nova experiência').click()
    page.get_by_role('button',name='Salvar avaliação').click()
    page.wait_for_timeout(350)
    assert 'Histórico pessoal' in page.locator('#screen').inner_text()
    page.screenshot(path=str(p/'previews/feedback-navy.png'))
    print('QA: homepage, exploração, unidade, jornada, feedback OK; erros de JS:',errors)
    browser.close()
    if errors: raise Exception('Falhas de JS: '+str(errors))
