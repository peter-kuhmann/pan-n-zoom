export default function PrivacyPolicyPage() {
  return (
    <div>
      <h1 className={"text-5xl font-semibold"}>Privacy Policy</h1>
      <p className={"mt-4 mb-8"}>
        This website does not collect any personal data. All the functionality
        that this website offers is done in a user's client (browser). All the
        data that can be "saved" or "uploaded" is stored in a user's client
        (browser).
      </p>
      <p className={"mt-4 mb-8"}>
        The only data required to process is all the technical data to serve
        this website. This includes the IP address and the requested URL. This
        data is not stored.
      </p>

      <h2 className={"text-3xl font-semibold"}>Terms</h2>
      <p className={"mt-4 mb-8"}>
        When the term "website" is used, this website including the offered
        "app" respectively "application" are meant, as they are the same
        technical entity.
      </p>
      <p className={"mt-4 mb-8"}>
        The term "user's client", "client" mean a user's software to load and
        view this website/application. In many cases, this is a so called
        "browser".
      </p>
      <p className={"mt-4 mb-8"}>
        "Base64" is a technique to store binary data (such as image data) in a
        text format that uses only characters of the ASCII alphabet. This
        technique is commonly used in browsers to handle images locally in a
        user's client/browser.
      </p>

      <h2 className={"text-3xl font-semibold"}>
        What data does this website store in my browser?
      </h2>
      <p className={"mt-4 mb-8"}>
        This data website stores the following data in your browsers own
        storage:
      </p>
      <ul className={"mt-4 mb-8 list-disc pl-8"}>
        <li>List of projects.</li>
        <li>
          Project settings (name, created and last opened dates, animation
          settings, SVG native embed setting).
        </li>
        <li>Project keyframes (position and size).</li>
        <li>Project images encoded as Base64.</li>
      </ul>

      <h2 className={"text-3xl font-semibold"}>
        Where does this website store the data in my browser?
      </h2>
      <p className={"mt-4 mb-8"}>
        All the data excluding the Base64 encoded images are stored in the
        Browser's "localStorage". This storage is only accessible by this
        website. The data can not be accessed by any servers nor is this data
        transferred by this website to any servers or third parties.
      </p>
      <p className={"mt-4 mb-8"}>
        The Base64 encoded images are stored in an "IndexedDB" database instance
        inside your browser. The images are stored in an "IndexedDB" database,
        because this storage technique allows to store big data objects (such as
        images). In contrast: The "localStorage" only allows to store data with
        at max 5MB. As images can easily exceed that file size, the "IndexedDB"
        technique is used. The database instance is only accessible by this
        website. The data can not be accessed by any servers nor is this data
        transferred by this website to any servers or third parties.
      </p>

      <h2 className={"text-3xl font-semibold"}>Website hosting</h2>
      <p className={"mt-4 mb-8"}>
        This website is hosted at the following external hoster:
      </p>
      <p className={"pl-8 mt-4 mb-8"}>
        Fly.io
        <br />
        2045 West Grand Avenue Suite B PMB 69109 Chicago, IL 60612
        <br />
        United States
      </p>
      <p className={"mt-4 mb-8"}>
        This website is hosted on Fly.io servers located in Amsterdam,
        Netherlands, Europe.
      </p>

      <h2 className={"text-3xl font-semibold"}>Contact</h2>
      <p className={"mt-4 mb-8"}>
        Responsible for any data processing related to this website/application
        is:
      </p>
      <p className={"pl-8 mt-4 mb-8"}>
        Peter Kuhmann
        <br />
        Engelswisch 50
        <br />
        23552 Lübeck
        <br />
        Telefon: +49 176 20126866
        <br />
        E-Mail: info@peter-kuhmann.de
      </p>
    </div>
  );
}
