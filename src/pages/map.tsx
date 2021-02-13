import { useI18n } from "i18n/index";
import { NextPage } from "next";
import { NextSeo } from "next-seo";
import React from "react";

const MapPage: NextPage = () => {
  const { t } = useI18n();
  return (
    <>
      <NextSeo
        title={t("map.title")}
        description={t("map.description")}
        openGraph={{}}
        canonical={`${process.env.APP_URI}/map`}
      />
      <h1 className="page-title">{t("map.title")}</h1>
      <p className="px-4 text-lg text-foreground-secondary">
        {t("map.description")}
      </p>
      <div className="px-4 font-bold text-primary">Coming soon!</div>
    </>
  );
};

export default MapPage;
