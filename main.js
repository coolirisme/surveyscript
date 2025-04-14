const SURVEY_ID = "a04VF000002dXPZYA2"; //Salesforce Survey Invite Id
const SURVEY_TIMEOUT_DAYS = 90;
const SURVEY_COUNTDOWN_SECONDS = 10;

let scriptsInjected = false;

const extractUserId = () => {
  const id = document.cookie
    .split(";")
    .map((x) => x.trim())
    .filter((x) => x.indexOf("LithiumUserInfo") > -1)[0]
    ?.split("=")[1];
  return id ? id : "anonymous";
};

const getNumberOfDays = (start, end) => {
  const date1 = new Date(start);
  const date2 = new Date(end);
  const oneDay = 1000 * 60 * 60 * 24;
  const diffInTime = date2.getTime() - date1.getTime();
  const diffInDays = Math.round(diffInTime / oneDay);
  return diffInDays;
};

const surveyCompleteEventHandler = (event) => {
  console.log(event.data);
  if (event.data === "Survey Completed") {
    setTimeout(() => {
      document.getElementsByClassName("mfp-close")[0]?.click();
    }, 5000);
  }
};

const injectScriptAndUse = () => {
  const head = document.getElementsByTagName("head")[0];
  const script = document.createElement("script");
  script.src =
    "https://cdnjs.cloudflare.com/ajax/libs/jquery/3.1.1/jquery.min.js";
  script.onload = () => {
    const script2 = document.createElement("script");
    script2.src =
      "https://preview.atomicwebdesign.com.au/raw-static/js/vendor/magnific-popup/magnific-popup.js";
    head.appendChild(script2);
    script2.onload = () => {
      const link = document.createElement("link");
      link.href =
        "https://preview.atomicwebdesign.com.au/raw-static/js/vendor/magnific-popup/magnific-popup.css";
      link.rel = "stylesheet";
      link.onload = () => {
        $(document).ready(function () {
          $(".survey-popup").magnificPopup({
            type: "inline",
            preloader: false,
            callbacks: {
              beforeOpen: function () {},
            },
          });
          const clickElement = document.getElementById("survey-click-element");
          clickElement.click();
        });
      };
      head.appendChild(link);
    };
  };
  head.appendChild(script);
};

const injectSurveyIframe = () => {
  addEventListener("message", surveyCompleteEventHandler);
  const userId = extractUserId();
  const div = document.createElement("div");
  div.id = "salesforce-survey-popup";
  div.classList.add("mfp-hide");
  div.style =
    "max-width:500px;margin:20px auto;padding:40px 0px 0px 0px;border-radius:0;background:#fff;text-align center;position:relative;overflow:hidden;height:70vh";
  const iframe = document.createElement("iframe");
  iframe.id = "survey-iframe";
  iframe.style = "width:100%;height:100%";
  iframe.src = `https://alteryx--ayxuat.sandbox.my.site.com/surveyhome/?inviteId=${SURVEY_ID}&userId=${userId}`;
  div.appendChild(iframe);
  const a = document.createElement("a");
  a.classList.add("survey-popup");
  a.id = "survey-click-element";
  a.href = "#salesforce-survey-popup";

  //Get Survey container
  const surveyContainer = document.getElementById("medalliatkbsurvey");
  if (surveyContainer) {
    surveyContainer.appendChild(a);
    surveyContainer.appendChild(div);
    if (!scriptsInjected) {
      injectScriptAndUse();
      scriptsInjected = true;
    }
  }
};

const countdown = (seconds, delay = 1000) => {
  setTimeout(() => {
    seconds--;
    if (seconds !== 0) {
      countdown(seconds, delay);
      console.log(seconds);
    } else {
      console.log(seconds);
      injectSurveyIframe();
    }
  }, delay);
};

const initSurveyScript = () => {
  const surveyContainer = document.getElementById("medalliatkbsurvey");
  if (!surveyContainer) {
    console.log("Survey not allowed on this page.");
    return;
  }
  if (localStorage.getItem("lastSurveyed")) {
    const diff = getNumberOfDays(
      localStorage.getItem("lastSurveyed"),
      new Date().toISOString()
    );
    if (diff > SURVEY_TIMEOUT_DAYS) {
      localStorage.setItem("lastSurveyed", new Date().toISOString());
      countdown(SURVEY_COUNTDOWN_SECONDS);
    } else {
      console.log(
        `Days remaining till next survey is triggered => ${
          SURVEY_TIMEOUT_DAYS - diff
        }`
      );
    }
  } else {
    localStorage.setItem("lastSurveyed", new Date().toISOString());
    countdown(SURVEY_COUNTDOWN_SECONDS);
  }
};

initSurveyScript();
