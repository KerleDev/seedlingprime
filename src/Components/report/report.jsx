import React from 'react';
import './Report.css';

export default function Report() {
  return (
    <div>
      <div className="report-body">
        <section
          className="brand-header"
          style={{ display: 'flex' }}
        >
          <div>
            <h1>Seedling </h1>
            <p>
              Getting you one big step closer to your financial goals{' '}
              <br />
              by bringing you the most accurate stock findings <br />
              powered with perplexity finance api and our screening
              methods
            </p>
          </div>
          <div>logo</div>
        </section>
        <hr />
        <section
          className="stock-intro"
          style={{ display: 'flex' }}
        >
          <p>
            stock company info | <br /> stock company info | <br />{' '}
            stock company info | <br /> stock company info |{' '}
            <br />{' '}
          </p>
          <div>
            <h3> introduction</h3>
            <p>introduction content</p>
          </div>
        </section>
        <hr />
        <p className="stock-positioning">
          the position: long (buy) or short (sell)
        </p>
        <hr />
        <section
          className="stock-details"
          style={{ display: 'flex' }}
        >
          <p className="stock-sentiment">
            Lorem ipsum dolor sit amet consectetur adipisicing elit.
            Maiores et quas doloremque rerum. Voluptates sed
            doloremque recusandae cumque aspernatur et sequi,
            excepturi id, debitis nihil quo dignissimos unde quasi
            eos? Doloremque ut asperiores, animi expedita nemo aut
            soluta sint veritatis alias fuga ea omnis tempore, sunt
            dolorum labore id rerum. Ullam exercitationem laborum
            consectetur excepturi deleniti. Deleniti animi
            voluptatibus aliquam!
          </p>
          <p className="stock-ratios">
            Lorem ipsum dolor sit amet consectetur adipisicing elit.
            Maiores et quas doloremque rerum. Voluptates sed
            doloremque recusandae cumque aspernatur et sequi,
            excepturi id, debitis nihil quo dignissimos unde quasi
            eos? Doloremque ut asperiores, animi expedita nemo aut
            soluta sint veritatis alias fuga ea omnis tempore, sunt
            dolorum labore id rerum. Ullam exercitationem laborum
            consectetur excepturi deleniti. Deleniti animi
            voluptatibus aliquam!
          </p>
        </section>
        <hr />
        <p className="disclaimer">disclaimer</p>
      </div>
    </div>
  );
}
