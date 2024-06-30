import React from 'react';
import { Link } from 'react-router-dom';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import styles from './Home.module.css';

const Home = () => {
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000
  };

  return (
    <div className={styles.home}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1>Welcome to Africhama</h1>
          <p>Empowering Success, Empowering Humanity</p>
          <Link to="/register" className={styles.ctaButton}>Join Now</Link>
        </div>
      </section>

      <section className={styles.slider}>
        <Slider {...sliderSettings}>
          <div>
            <picture>
              <source media="(max-width: 640px)" srcSet="/images/slide1-mobile.jpg" />
              <img src="/images/slide1-desktop.jpg" alt="Empowering Communities" />
            </picture>
            <div className={styles.slideCaption}>Empowering Communities</div>
          </div>
          <div>
            <picture>
              <source media="(max-width: 640px)" srcSet="/images/slide2-mobile.jpg" />
              <img src="/images/slide2-desktop.jpg" alt="Building Networks" />
            </picture>
            <div className={styles.slideCaption}>Building Networks</div>
          </div>
          <div>
            <picture>
              <source media="(max-width: 640px)" srcSet="/images/slide3-mobile.jpg" />
              <img src="/images/slide3-desktop.jpg" alt="Fostering Growth" />
            </picture>
            <div className={styles.slideCaption}>Fostering Growth</div>
          </div>
        </Slider>
      </section>

      <section className={styles.features}>
        <h2>Why Choose Africhama?</h2>
        <div className={styles.featureGrid}>
          <div className={styles.featureItem}>
            <img src="/icons/education.svg" alt="Education" />
            <h3>Free Educational Materials</h3>
            <p>Access a wide range of free downloadable content on entrepreneurship, health, nature, and life skills.</p>
          </div>
          <div className={styles.featureItem}>
            <img src="/icons/network.svg" alt="Network" />
            <h3>Networking Opportunities</h3>
            <p>Connect with like-minded individuals and grow your professional network across Africa and beyond.</p>
          </div>
          <div className={styles.featureItem}>
            <img src="/icons/gift.svg" alt="Gift" />
            <h3>Unique Gift System</h3>
            <p>Participate in our innovative gift donation system and support fellow members in their journey to success.</p>
          </div>
        </div>
      </section>

      <section className={styles.about}>
        <h2>About Africhama</h2>
        <p>Africhama is an online platform dedicated to empowering individuals through knowledge sharing and community support. Our name combines "Afri-" from Africa and "Chama," a Swahili word embodying the principle of collective success.</p>
        <p>We believe in the power of collaboration and mutual support to drive personal and professional growth across the African continent and beyond.</p>
      </section>

      <section className={styles.cta}>
        <h2>Ready to Start Your Journey?</h2>
        <p>Join Africhama today and take the first step towards empowering your success and contributing to a brighter future for all.</p>
        <Link to="/register" className={styles.ctaButton}>Get Started</Link>
      </section>
    </div>
  );
};

export default Home;