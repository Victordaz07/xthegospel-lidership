import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../context/I18nContext';
import { StorageService } from '../utils/storage';
import { FIRST_OPEN_WELCOME_KEY } from '../config/welcome';
import './FirstOpenWelcome.css';

interface Slide {
  title: string;
  description: string;
}

const FirstOpenWelcome: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [currentStep, setCurrentStep] = useState(0);

  const slides = useMemo<Slide[]>(
    () => [
      {
        title: t('app.welcome.slides.0.title'),
        description: t('app.welcome.slides.0.description'),
      },
      {
        title: t('app.welcome.slides.1.title'),
        description: t('app.welcome.slides.1.description'),
      },
      {
        title: t('app.welcome.slides.2.title'),
        description: t('app.welcome.slides.2.description'),
      },
    ],
    [t],
  );

  const isLastStep = currentStep === slides.length - 1;

  const finishWelcome = () => {
    StorageService.setItem(FIRST_OPEN_WELCOME_KEY, 'true');
    navigate('/login', { replace: true });
  };

  return (
    <main className="leaders-first-open">
      <section className="leaders-first-open__card">
        <p className="leaders-first-open__eyebrow">{t('app.welcome.eyebrow')}</p>
        <h1 className="leaders-first-open__title">{t('app.welcome.title')}</h1>
        <p className="leaders-first-open__subtitle">{t('app.welcome.subtitle')}</p>

        <article className="leaders-first-open__slide">
          <h2 className="leaders-first-open__slide-title">{slides[currentStep].title}</h2>
          <p className="leaders-first-open__slide-description">
            {slides[currentStep].description}
          </p>
        </article>

        <div className="leaders-first-open__dots" aria-label={t('app.welcome.progressLabel')}>
          {slides.map((_, index) => (
            <span
              key={index}
              className={`leaders-first-open__dot ${
                index === currentStep ? 'leaders-first-open__dot--active' : ''
              }`}
            />
          ))}
        </div>

        <div className="leaders-first-open__actions">
          <button
            type="button"
            className="leaders-first-open__btn leaders-first-open__btn--ghost"
            onClick={finishWelcome}
          >
            {t('app.welcome.skip')}
          </button>
          <button
            type="button"
            className="leaders-first-open__btn leaders-first-open__btn--primary"
            onClick={() => (isLastStep ? finishWelcome() : setCurrentStep((prev) => prev + 1))}
          >
            {isLastStep ? t('app.welcome.start') : t('app.welcome.next')}
          </button>
        </div>
      </section>
    </main>
  );
};

export default FirstOpenWelcome;
