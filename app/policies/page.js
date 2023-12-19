"use client";

import parse from "html-react-parser";
import { useEffect, useState } from "react";

export default function Policies() {
  const [data, setData] = useState("");
  useEffect(() => {
    const fetchContent = async () => {
      const response = await fetch("/api/policy");
      const data = await response.json();
      const parsed = parse(data);
      console.log(parsed);
      setData(parsed);
    };

    fetchContent();
  }, []);
  return (
    <div className="mt-32 mb-16 text-gray-800">
      <h1 className="scroll-m-20 text-4xl font-bold tracking-tight lg:text-5xl">
        Copyright Enforcements and Policies
      </h1>
      <p className="leading-7 [&:not(:first-child)]:mt-6">
        Welcome to MyHeroList's (MHL) Copyright Enforcement and Policies page.
        Here, it will be outlined the website's commitment to protecting
        intellectual property rights, ensuring user privacy, and maintaining a
        secure and respectful online environment.
      </p>
      <h2 className="mt-10 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0">
        Security and Privacy Policy
      </h2>
      <h3 className="mt-8 scroll-m-20 text-2xl font-semibold tracking-tight">
        Data Collection
      </h3>
      <ul className="my-6 ml-6 list-disc [&>li]:mt-2">
        <li>
          Registration Information: When you sign up, MHL collects basic
          information such as your name, email address, and password.
        </li>
        <li>
          List Creation and Interaction Data: As you create lists of heroes and
          interact with others’ lists, MHL stores this data to personalize your
          experience.
        </li>
        <li>
          Reviews and Comments: MHL collects the content of your reviews and
          comments on various hero lists.
        </li>
      </ul>
      <h3 className="mt-8 scroll-m-20 text-2xl font-semibold tracking-tight">
        Data Protection
      </h3>
      <ul className="my-6 ml-6 list-disc [&>li]:mt-2">
        <li>
          Security Measures: MHL employs various security measures like SSL
          encryption and secure server hosting to protect user data.
        </li>
        <li>
          Data Access: Access to personal data within MHL is restricted and only
          provided to staff members when necessary.
        </li>
      </ul>
      <h3 className="mt-8 scroll-m-20 text-2xl font-semibold tracking-tight">
        Third-Party Sharing
      </h3>
      <ul className="my-6 ml-6 list-disc [&>li]:mt-2">
        <li>
          Limited Sharing: MHL does not sell or share personal information with
          third parties, except for essential service provision, legal
          requirements, or with explicit consent from users.
        </li>
      </ul>
      <h2 className="mt-20 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0">
        Acceptable Use Policy (AUP)
      </h2>
      <h3 className="mt-8 scroll-m-20 text-2xl font-semibold tracking-tight">
        Prohibited Activities
      </h3>
      <ul className="my-6 ml-6 list-disc [&>li]:mt-2">
        <li>Illegal activities or actions that violate any applicable laws.</li>
        <li>
          Posting harmful or offensive content, including hate speech,
          harassment, and explicit material.
        </li>
        <li>Engaging in fraudulent activities or scams.</li>
        <li>
          Disrupting the services or servers with activities like spamming or
          distributing malware.
        </li>
      </ul>
      <h3 className="mt-8 scroll-m-20 text-2xl font-semibold tracking-tight">
        Content Standards
      </h3>
      <ul className="my-6 ml-6 list-disc [&>li]:mt-2">
        <li>Ensuring content is appropriate, respectful, and non-offensive.</li>
        <li>
          Respecting intellectual property rights and not posting infringing
          content.
        </li>
        <li>Avoiding misleading or false information.</li>
        <li>Adhering to the community guidelines of MHL.</li>
      </ul>
      <h3 className="mt-8 scroll-m-20 text-2xl font-semibold tracking-tight">
        Enforcement and Consequences
      </h3>
      <ul className="my-6 ml-6 list-disc [&>li]:mt-2">
        <li>Removal of content that violates the AUP.</li>
        <li>
          Suspension or termination of user accounts for serious or repeated
          violations.
        </li>
        <li>
          Reporting to law enforcement in cases of severe misconduct or illegal
          activities.
        </li>
      </ul>
      <h2 className="mt-20 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0">
        DMCA Notice & Takedown Policy
      </h2>
      <h3 className="mt-8 scroll-m-20 text-2xl font-semibold tracking-tight">
        Filing a DMCA Notice
      </h3>
      <ul className="my-6 ml-6 list-disc [&>li]:mt-2">
        <li>
          Provide a clear description of the copyrighted work that you claim has
          been infringed.
        </li>
        <li>
          Identify the material on MHL that you allege is infringing, with
          enough detail so that we can locate it on the site.
        </li>
        <li>
          Include your contact information: name, address, telephone number, and
          email address.
        </li>
        <li>
          Include a statement that you have a good faith belief that the use of
          the material in the manner complained of is not authorized by the
          copyright owner, its agent, or the law.
        </li>
        <li>
          Include a statement that the information in the notification is
          accurate, and under penalty of perjury, that you are authorized to act
          on behalf of the owner of an exclusive right that is allegedly
          infringed.
        </li>
        <li>Provide your physical or electronic signature.</li>
      </ul>
      <h3 className="mt-8 scroll-m-20 text-2xl font-semibold tracking-tight">
        MHL's Response to DMCA Notices
      </h3>
      <ul className="my-6 ml-6 list-disc [&>li]:mt-2">
        <li>
          Upon receipt of a valid DMCA notice, MHL will promptly remove or
          disable access to the infringing material.
        </li>
        <li>
          MHL will notify the user who posted the material, providing them with
          the DMCA notice details.
        </li>
      </ul>
      <h3 className="mt-8 scroll-m-20 text-2xl font-semibold tracking-tight">
        Repeat Infringers
      </h3>
      <ul className="my-6 ml-6 list-disc [&>li]:mt-2">
        <li>
          MHL adopts a policy of terminating, in appropriate circumstances,
          users who are deemed to be repeat infringers.
        </li>
        <li>
          MHL may also at its sole discretion limit access to the platform
          and/or terminate the accounts of any users who infringe any
          intellectual property rights of others, whether or not there is any
          repeat infringement. Please contact arhansari651@gmail.com to send any
          notice of infringement.
        </li>
      </ul>
    </div>
  );
}
