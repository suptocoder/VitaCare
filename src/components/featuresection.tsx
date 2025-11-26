import React from "react";
import Link from "next/link";
import { Button } from "./ui/button";

function FeatureSection() {
  return (
    <>

      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose VitaCare?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Built for hospitals, doctors, and patients — VitaCare simplifies
              medical records and makes collaboration seamless.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-md border">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-5">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Secure Record Management
              </h3>
              <p className="text-gray-600">
                Store all your records in one secure place with detailed access
                control and audit trails.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md border">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-5">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Seamless Collaboration
              </h3>
              <p className="text-gray-600">
                Enable real-time communication between doctors and patients —
                across hospitals and time zones.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tailored for Everyone */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Tailored for Everyone
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Whether you're a patient, doctor, or hospital admin — VitaCare has
              a personalized dashboard for your needs.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "For Patients",
                color: "blue",
                textColor: "text-blue-700",
                iconColor: "text-blue-500",
                borderColor: "border-blue-100",
                features: [
                  "View complete medical history",
                  "Control privacy settings",
                  "Manage access requests",
                  "Schedule appointments",
                ],
                link: "/auth?tab=register&role=patient",
              },
              {
                title: "For Doctors",
                color: "green",
                textColor: "text-green-700",
                iconColor: "text-green-500",
                borderColor: "border-green-100",
                features: [
                  "Request patient records",
                  "Manage appointments",
                  "Create medical records",
                  "Search patient database",
                ],
                link: "/auth?tab=register&role=doctor",
              },
              {
                title: "For Administrators",
                color: "purple",
                textColor: "text-purple-700",
                iconColor: "text-purple-500",
                borderColor: "border-purple-100",
                features: [
                  "Manage staff accounts",
                  "Monitor system access",
                  "View analytics dashboard",
                  "Configure system settings",
                ],
                link: "/auth?tab=register&role=admin",
              },
            ].map((role, i) => (
              <div
                key={i}
                className={`bg-gradient-to-br from-${role.color}-50 to-white p-6 rounded-xl shadow-sm border ${role.borderColor}`}
              >
                <h3 className={`text-xl font-bold ${role.textColor} mb-4`}>
                  {role.title}
                </h3>
                <ul className="space-y-3 text-gray-600">
                  {role.features.map((f, idx) => (
                    <li key={idx} className="flex items-center">
                      <svg
                        className={`h-5 w-5 ${role.iconColor} mr-2`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href={role.link}>
                  <Button className="w-full mt-6" variant="outline">
                    Register as {role.title.split(" ")[1]}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export default FeatureSection;
