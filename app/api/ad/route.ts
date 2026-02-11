import { NextResponse } from 'next/server';

const ADS_MAP: Record<string, string> = {
  'gmarket_d': 'https://click.linkprice.com/click.php?m=gmarket&a=A100702467&l=6775&u_id=',
  'lenovo_d': 'https://click.linkprice.com/click.php?m=lenovo&a=A100702467&l=DKT0&u_id=',
  'himart_d': 'https://click.linkprice.com/click.php?m=himart&a=A100702467&l=Oze4&u_id=',
  'coupang_d': 'https://link.coupang.com/a/dJuZZw',
  'aliexpress_d': 'https://click.linkprice.com/click.php?m=aliexpress&a=A100702467&l=8PXG&u_id=',
  
  'himart_m1': 'https://click.linkprice.com/click.php?m=himart&a=A100702467&l=TJzp&u_id=',
  'himart_m2': 'https://click.linkprice.com/click.php?m=himart&a=A100702467&l=xGIZ&u_id=',
  'gmarket_m': 'https://click.linkprice.com/click.php?m=gmarket&a=A100702467&l=A7tz&u_id=',
  
  'grid_himart': 'https://click.linkprice.com/click.php?m=himart&a=A100702467&l=nyIP&u_id=',
  'grid_gmarket': 'https://click.linkprice.com/click.php?m=gmarket&a=A100702467&l=1638&u_id=',
  'grid_coupang': 'https://link.coupang.com/a/dJuj4r',
  'grid_aliexpress': 'https://click.linkprice.com/click.php?m=aliexpress&a=A100702467&l=Cq7c&u_id='
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id || !ADS_MAP[id]) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  return NextResponse.redirect(ADS_MAP[id], 307);
}