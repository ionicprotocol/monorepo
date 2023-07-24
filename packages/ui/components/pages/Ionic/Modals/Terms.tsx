import { Button, Flex, ListItem, Spacer, Text, UnorderedList, VStack } from '@chakra-ui/react';
import { useEffect, useState } from 'react';

import { IonicModal } from '@ui/components/shared/Modal';
import { IONIC_T_AND_C_ACCEPTED } from '@ui/constants/index';

const Terms = ({ isAcceptedTerms }: { isAcceptedTerms: boolean }) => {
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState<boolean>(isAcceptedTerms);

  const accept = () => {
    setHasAcceptedTerms(true);
  };

  useEffect(() => {
    localStorage.setItem(IONIC_T_AND_C_ACCEPTED, 'true');
  }, [hasAcceptedTerms]);

  return (
    <IonicModal
      body={
        <Flex flexDir={'column'} pr={2}>
          <Text fontWeight="bold" size="lg">
            1. Acceptance of Terms
          </Text>
          <Text>
            The Ionic Protocol system and software (the “Ionic Protocol”) is an autonomous system of
            smart contracts on various blockchains that permits, among other things, transactions
            using smart contracts, and lending and borrowing of cryptocurrencies. The Ionic
            Protocol, https://midascapital.xyz (the “Interface” or “App”) — which includes text,
            images, audio, code and other materials (collectively, the &quot;Content&quot;) and all
            of the features provided. Note, however, the Ionic Protocol is an experimental prototype
            and its use involves a high degree of risk. There are numerous ways the Ionic Protocol
            could fail in an unexpected way, resulting in the total and absolute loss of funds in
            the protocol. Please read these Terms of Use (the “Terms” or “Terms of Use”) carefully
            before using the Service. By using or otherwise accessing the Service, or clicking to
            accept or agree to these Terms where that option is made available, you (1) accept and
            agree to these Terms and (2) any additional terms, rules and conditions of participation
            issued from time to time. If you do not agree to the Terms, then you may not access or
            use the Content or Site.
          </Text>
          <Text fontWeight="bold" size="lg">
            2. Modification of Terms of Use
          </Text>
          <Text>
            These Terms may be discretionarily modified or replaced at any time, unless stated
            otherwise herein. The most current version of these Terms will be posted on the
            Interface with the &quot;Last Revised&quot; date at the top of the Terms changed. Any
            modifications will be effective immediately upon posting the revisions to the Interface.
            You shall be responsible for reviewing and becoming familiar with any such
            modifications. You waive any right you may have to receive specific notice of such
            changes or modifications. Use of the Interface by you after any modification to the
            Terms constitutes your acceptance of the Terms as modified. If you do not agree to the
            Terms in effect when you access or use the Interface, you must stop using the Interface.
          </Text>
          <Text fontWeight="bold" size="lg">
            3. Eligibility
          </Text>
          <Text>
            You hereby represent and warrant that you are fully able and competent to enter into the
            terms, conditions, obligations, affirmations, representations and warranties set forth
            in these Terms and to abide by and comply with these Terms. The Ionic Protocol is global
            and by accessing the Interface, you are representing and warranting that, you are of the
            legal age of majority in your jurisdiction as is required to access the Interface and
            enter into arrangements.. You further represent that you are otherwise legally permitted
            to use the service in your jurisdiction including owning cryptographic tokens of value,
            and interacting with the Interface and Ionic Protocol. You further represent you are
            responsible for ensuring compliance with the laws of your jurisdiction and acknowledge
            that Midas Labs Ltd. & Midas Labs FZE LLC is not. liable for your compliance with such
            laws. Finally, you represent and warrant that you will not use the Service for any
            illegal activity.
          </Text>
          <Text fontWeight="bold" size="lg">
            4. Representations, Warranties, and Risks
          </Text>
          <Text textDecoration={'underline'}>4.1. No Representation or Warranty.</Text>
          <Text>
            You expressly understand and agree that your use of the Service is at your sole risk.
            (A) MIDAS LABS LTD. & MIDAS LABS FZE LLC EXPRESSLY DISCLAIMS ALL REPRESENTATIONS AND
            WARRANTIES, EXPRESS, IMPLIED OR STATUTORY; AND (B) WITH RESPECT TO THE MIDAS LABS LTD. &
            MIDAS LABS FZE LLC, MIDAS LABS LTD. & MIDAS LABS FZE LLC SPECIFICALLY DOES NOT REPRESENT
            AND WARRANT AND EXPRESSLY DISCLAIMS ANY REPRESENTATION OR WARRANTY, EXPRESS, IMPLIED OR
            STATUTORY, INCLUDING WITHOUT LIMITATION, ANY REPRESENTATIONS OR WARRANTIES OF TITLE,
            NON-INFRINGEMENT, MERCHANTABILITY, USAGE, SECURITY, SUITABILITY OR FITNESS FOR ANY
            PARTICULAR PURPOSE, OR AS TO THE WORKMANSHIP OR TECHNICAL CODING THEREOF, OR THE ABSENCE
            OF ANY DEFECTS THEREIN, WHETHER LATENT OR PATENT. MIDAS LABS LTD. & MIDAS LABS FZE LLC
            DO NOT REPRESENT OR WARRANT THAT THE SERVICE AND ANY RELATED INFORMATION ARE ACCURATE,
            COMPLETE, RELIABLE, CURRENT OR ERROR-FREE.
          </Text>
          <Text textDecoration={'underline'}>4.2 Disclaimer of Fiduciary Duties</Text>
          <Text>
            TO THE FULLEST EXTENT PERMITTED BY LAW AND NOTWITHSTANDING ANY OTHER PROVISION OF THIS
            AGREEMENT OR ANY OTHER AGREEMENT CONTEMPLATED HEREIN OR APPLICABLE PROVISIONS OF LAW OR
            EQUITY OR OTHERWISE, THE PARTIES HERETO HEREBY AGREE TO ELIMINATE ANY AND ALL FIDUCIARY
            DUTIES MIDAS LABS LTD. & MIDAS LABS FZE LLC OR ANY RELATED ENTITIES AND AGENTS MAY HAVE
            TO THE USER, ITS AFFILIATES, OR THE END USERS OF MIDAS LABS LTD. & MIDAS LABS FZE LLC,
            THE INTERFACE OR THE CONTENT, PROVIDED THAT SUCH EXCLUSION OR LIMITATION OF LIABILITY
            SHALL NOT EXTEND TO MISAPPROPRIATION OF ASSETS OR FUNDS OF THE USERS, ITS AFFILIATES, OR
            THE USERS OF MIDAS LABS LTD. & MIDAS LABS FZE LLC OR INTERFACE OR CONTENT PROVIDED BY
            MIDAS LABS LTD. & MIDAS LABS FZE LLC OR ANY RELATED ENTITIES AND AGENTS OR OTHER ACTS OR
            OMISSIONS THAT CONSTITUTE A BAD FAITH VIOLATION OF THE IMPLIED CONTRACTUAL COVENANT OF
            GOOD FAITH AND FAIR DEALING.
          </Text>
          <Text textDecoration={'underline'}>
            4.3 Sophistication and Risk of Cryptographic Systems
          </Text>
          <Text>
            By utilizing the Ionic Protocol or Interface or interacting with the Content in any way,
            you represent that you understand the inherent risks associated with cryptographic
            systems; and warrant that you have an understanding of the usage and intricacies of
            native cryptographic tokens, like Ether (ETH) and smart contract based tokens such as
            those that follow the Ethereum Token Standard
            (https://github.com/ethereum/EIPs/issues/20), and blockchain-based software systems.
            Midas Labs Ltd. & Midas Labs FZE LLC does not own or control any of the underlying
            software through which blockchain networks are formed. In general, the underlying
            software for blockchain networks tends to be open source such that anyone can use, copy,
            modify, and distribute it. By using the Ionic Protocol and the Interface, you
            acknowledge and agree (i) Midas Labs Ltd. & Midas Labs FZE LLC is not responsible for
            operation of the underlying software and networks that there exists no guarantee of
            functionality, security, or availability of such software and networks; and (ii) that
            the underlying protocols are subject to sudden changes in operating rules (known as
            &quot;Forks&quot;), and that such Forks may materially affect the Ionic Protocol
            Protocol. It might be discretionarily decided not to support (or cease supporting) the
            Forked network entirely. You acknowledge and agree that the Midas Labs Ltd. & Midas Labs
            FZE LLC assumes absolutely no responsibility whatsoever in respect of any underlying
            software protocols, whether Forked or not.
          </Text>
          <Text textDecoration={'underline'}>
            4.4 Risk of Regulatory Actions in One or More Jurisdictions
          </Text>

          <Text>
            The Ionic Protocol, the Interface, and cryptocurrencies in protocol could be impacted by
            one or more regulatory inquiries or regulatory action, which could impede or limit the
            ability of Midas Labs Ltd. & Midas Labs FZE LLC to continue to develop, or which could
            impede or limit your ability to access or use the Service or Ethereum blockchain,
            including access to your funds.
          </Text>
          <Text textDecoration={'underline'}>
            4.5 Risk of Weaknesses or Exploits in the Field of Cryptography
          </Text>

          <Text>
            You acknowledge and understand that Cryptography is a progressing field. Advances in
            code cracking or technical advances such as the development of quantum computers may
            present risks to cryptocurrencies and Ionic Protocol, Interface or accessing Content,
            which could result in the theft or loss of your cryptographic tokens or property. To the
            extent possible, it is intended to update the protocol underlying the Service to account
            for any advances in cryptography and to incorporate additional security measures, but
            does not guarantee or otherwise represent full security of the system. By using the
            Ionic Protocol, Interface or accessing Content, you acknowledge these inherent risks.
          </Text>
          <Text textDecoration={'underline'}>4.6 Volatility of Cryptocurrency</Text>

          <Text>
            You understand that Ethereum and other blockchain technologies and associated currencies
            or tokens are highly volatile due to many factors including but not limited to adoption,
            speculation, technology and security risks. You also acknowledge that the cost of
            transacting on such technologies is variable and may increase at any time causing impact
            to any activities taking place on the Ethereum blockchain. You acknowledge these risks
            and represent that Midas Labs Ltd. & Midas Labs FZE LLC or any related entity or person
            cannot be held liable for such fluctuations or increased costs.
          </Text>

          <Text textDecoration={'underline'}>4.7 Application Security</Text>

          <Text>
            You acknowledge that the Ionic Protocol and Interface are subject to flaws and
            acknowledge that you are solely responsible for evaluating any code provided via the
            Ionic Protocol, Interface or Content, including those approved and integrated via the
            TRIBE DAO. This warning and others later provided by Midas Labs Ltd. & Midas Labs FZE
            LLC in no way evidence or represent an on-going duty to alert you to all of the
            potential risks of utilizing the Ionic Protocol, Interface or accessing Content.
          </Text>

          <Text textDecoration={'underline'}>4.8 Website Accuracy</Text>

          <Text>
            Although it is intended to provide accurate and timely information on the Interface and
            other tools making up the Ionic Protocol, the Interface (including, without limitation,
            the Content) or relevant tools may not always be entirely accurate, complete or current
            and may also include technical inaccuracies or typographical errors. In an effort to
            continue to provide you with as complete and accurate information as possible,
            information may be changed or updated from time to time without notice, including
            without limitation information regarding our policies. Accordingly, you should verify
            all information before relying on it, and all decisions based on information contained
            on the Interface or relevant tools are your sole responsibility and Midas Labs Ltd. &
            Midas Labs FZE LLC shall have no liability for such decisions. Links to third-party
            materials (including without limitation websites) may be provided as a convenience but
            are not controlled by any entity. You acknowledge and agree that we are not responsible
            for any aspect of the information, content, or services contained in any third-party
            materials or on any third party sites accessible or linked to the Interface or available
            via other relevant tools.
          </Text>

          <Text textDecoration={'underline'}>4.9 Technical Knowledge</Text>

          <Text>
            Any use or interaction with the Ionic Protocol and Interface requires a comprehensive
            understanding of applied cryptography and computer science in order to appreciate
            inherent risks, including those listed above. You represent and warrant that you possess
            relevant knowledge and skills.
          </Text>
          <Text fontWeight="bold" size="lg">
            5. Indemnity
          </Text>
          <Text>
            You agree to release and to indemnify, defend and hold harmless Midas Labs Ltd. & Midas
            Labs FZE LLC and any related entities, as well as the officers, directors, employees,
            shareholders and representatives of any of the foregoing entities, from and against any
            and all losses, liabilities, expenses, damages, costs (including attorneys&apos; fees,
            fees or penalties imposed by any regulatory authority and court costs) claims or actions
            of any kind whatsoever arising or resulting from your use of the Service, your violation
            of these Terms of Use, your violation of any law, rule, or regulation, or the rights of
            any third party, and any of your acts or omissions that implicate publicity rights,
            defamation or invasion of privacy. Each of the Midas Labs Ltd. & Midas Labs FZE LLC
            reserve the right, at its own expense, to assume exclusive defense and control of any
            matter otherwise subject to indemnification by you and, in such case, you agree to
            cooperate with Midas Labs Ltd. & Midas Labs FZE LLC in the defense of such matter.
          </Text>
          <Text fontWeight="bold" size="lg">
            6. Limitation on liability
          </Text>
          <Text>
            YOU ACKNOWLEDGE AND AGREE THAT YOU ASSUME FULL RESPONSIBILITY FOR YOUR USE OF THE SITE
            AND SERVICE. YOU ACKNOWLEDGE AND AGREE THAT ANY INFORMATION YOU SEND OR RECEIVE DURING
            YOUR USE OF THE SITE AND SERVICE MAY NOT BE SECURE AND MAY BE INTERCEPTED OR LATER
            ACQUIRED BY UNAUTHORIZED PARTIES. YOU ACKNOWLEDGE AND AGREE THAT YOUR USE OF THE SITE
            AND SERVICE IS AT YOUR OWN RISK. RECOGNIZING SUCH, YOU UNDERSTAND AND AGREE THAT, TO THE
            FULLEST EXTENT PERMITTED BY APPLICABLE LAW, NEITHER MIDAS LABS LTD. & MIDAS LABS FZE LLC
            NOR ANY RELATED ENTITIES, SUPPLIERS OR LICENSORS WILL BE LIABLE TO YOU FOR ANY DIRECT,
            INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, PUNITIVE, EXEMPLARY OR OTHER DAMAGES OF
            ANY KIND, INCLUDING WITHOUT LIMITATION DAMAGES FOR LOSS OF PROFITS, GOODWILL, USE, DATA
            OR OTHER TANGIBLE OR INTANGIBLE LOSSES OR ANY OTHER DAMAGES BASED ON CONTRACT, TORT,
            STRICT LIABILITY OR ANY OTHER THEORY (EVEN IF MIDAS LABS LTD. & MIDAS LABS FZE LLC OR
            RELATED ENTITIES HAD BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES), RESULTING FROM
            THE SITE OR SERVICE; THE USE OR THE INABILITY TO USE THE SITE OR SERVICE; UNAUTHORIZED
            ACCESS TO OR ALTERATION OF YOUR TRANSMISSIONS OR DATA; STATEMENTS OR CONDUCT OF ANY
            THIRD PARTY ON THE SITE OR SERVICE; ANY ACTIONS WE TAKE OR FAIL TO TAKE AS A RESULT OF
            COMMUNICATIONS YOU SEND TO US; HUMAN ERRORS; TECHNICAL MALFUNCTIONS; FAILURES, INCLUDING
            PUBLIC UTILITY OR TELEPHONE OUTAGES; OMISSIONS, INTERRUPTIONS, LATENCY, DELETIONS OR
            DEFECTS OF ANY DEVICE OR NETWORK, PROVIDERS, OR SOFTWARE (INCLUDING, BUT NOT LIMITED TO,
            THOSE THAT DO NOT PERMIT PARTICIPATION IN THE SERVICE); ANY INJURY OR DAMAGE TO COMPUTER
            EQUIPMENT; INABILITY TO FULLY ACCESS THE SITE OR SERVICE OR ANY OTHER WEBSITE; THEFT,
            TAMPERING, DESTRUCTION, OR UNAUTHORIZED ACCESS TO, IMAGES OR OTHER CONTENT OF ANY KIND;
            DATA THAT IS PROCESSED LATE OR INCORRECTLY OR IS INCOMPLETE OR LOST; TYPOGRAPHICAL,
            PRINTING OR OTHER ERRORS, OR ANY COMBINATION THEREOF; OR ANY OTHER MATTER RELATING TO
            THE SITE OR SERVICE. SOME JURISDICTIONS DO NOT ALLOW THE EXCLUSION OF CERTAIN WARRANTIES
            OR THE LIMITATION OR EXCLUSION OF LIABILITY FOR INCIDENTAL OR CONSEQUENTIAL DAMAGES.
            ACCORDINGLY, SOME OF THE ABOVE LIMITATIONS MAY NOT APPLY TO YOU.
          </Text>
          <Text fontWeight="bold" size="lg">
            7. Proprietary Rights
          </Text>
          <Text>
            All title, ownership and intellectual property rights in and to the Interface and Midas
            Capital Protocol are owned by Midas Labs Ltd. & Midas Labs FZE LLC, related entities or
            their licensors. You acknowledge and agree that the Ionic Protocol, Interface and
            Content contain proprietary and confidential information that is protected by applicable
            intellectual property and other laws. Except as expressly authorized by a relevant
            entity, you agree not to copy, modify, rent, lease, loan, sell, distribute, perform,
            display or create derivative works based on the Ionic Protocol, Interface and Content,
            in whole or in part.
          </Text>
          <Text fontWeight="bold" size="lg">
            8. Links
          </Text>
          <Text>
            The Service provides, or third parties may provide, links to other World Wide Web or
            accessible sites, applications or resources. Because none of the Midas Labs Ltd. & Midas
            Labs FZE LLC have control over such sites, applications and resources, you acknowledge
            and agree that Midas Labs Ltd. & Midas Labs FZE LLC or any related entity is not
            responsible for the availability of such external sites, applications or resources, and
            does not endorse and is not responsible or liable for any content, advertising, products
            or other materials on or available from such sites or resources. You further acknowledge
            and agree that Midas Labs Ltd. & Midas Labs FZE LLC or any related entity shall not be
            responsible or liable, directly or indirectly, for any damage or loss caused or alleged
            to be caused by or in connection with use of or reliance on any such content, goods or
            services available on or through any such site or resource.
          </Text>
          <Text fontWeight="bold" size="lg">
            9. Termination and Suspension
          </Text>
          <Text>
            Midas Labs Ltd. & Midas Labs FZE LLC may terminate or suspend access to the Interface
            immediately, without prior notice or liability, if you breach any of the terms or
            conditions of the Terms. Upon termination of your access, your right to use the
            Interface will immediately cease. The following provisions of the Terms survive any
            termination of these Terms: INDEMNITY; WARRANTY DISCLAIMERS; LIMITATION ON LIABILITY;
            OUR PROPRIETARY RIGHTS; LINKS; TERMINATION; NO THIRD-PARTY BENEFICIARIES; BINDING
            ARBITRATION AND CLASS ACTION WAIVER; GENERAL INFORMATION.
          </Text>
          <Text fontWeight="bold" size="lg">
            10. No Third-Party Beneficiaries
          </Text>
          <Text>
            You agree that, except as otherwise expressly provided in these Terms, there shall be no
            third party beneficiaries to the Terms.
          </Text>
          <Text fontWeight="bold" size="lg">
            11. Notice and Procedure For Making Claims of Copyright Infringement
          </Text>
          <Text>
            If you believe that your copyright or the copyright of a person on whose behalf you are
            authorized to act has been infringed, please provide a written Notice
            (contact@midaslabsltd.xyz) containing the following information:
          </Text>
          <UnorderedList>
            <ListItem>
              {' '}
              an electronic or physical signature of the person authorized to act on behalf of the
              owner of the copyright or other intellectual property interest;
            </ListItem>
            <ListItem>
              {' '}
              a description of the copyrighted work or other intellectual property that you claim
              has been infringed;
            </ListItem>
            <ListItem>
              {' '}
              a description of where the material that you claim is infringing is located on the
              Service;
            </ListItem>
            <ListItem> your address, telephone number, and email address;</ListItem>
            <ListItem>
              {' '}
              a statement by you that you have a good faith belief that the disputed use is not
              authorized by the copyright owner, its agent, or the law;
            </ListItem>
            <ListItem>
              {' '}
              a statement by you, made under penalty of perjury, that the above information in your
              Notice is accurate and that you are the copyright or intellectual property owner or
              authorized to act on the copyright or intellectual property owner&apos;s behalf.
            </ListItem>
          </UnorderedList>
          <Text fontWeight="bold" size="lg">
            12. Arbitration and Class Action Waiver
          </Text>
          <Text textDecoration={'underline'}>12.1. Initial Dispute Resolution</Text>

          <Text>
            The parties agree shall use their best efforts to engage directly to settle any dispute,
            claim, question, or disagreement and engage in good faith negotiations which shall be a
            condition to either party initiating an arbitration.
          </Text>

          <Text textDecoration={'underline'}>12.2. Binding Arbitration</Text>

          <Text>
            If we cannot resolve the dispute through good-faith negotiations, you and we agree that
            any dispute arising under this Agreement shall be finally settled in binding
            arbitration, on an individual basis, in accordance with the American Arbitration
            Association&apos;s rules for arbitration of consumer-related disputes (accessible at
            https://www.adr.org/sites/default/files/Consumer%20Rules.pdf) and you and Midas Labs
            Ltd. & Midas Labs FZE LLC hereby expressly waive trial by jury and right to participate
            in a class action lawsuit or class-wide arbitration. The arbitration will be conducted
            by a single, neutral arbitrator and shall take place in the county or parish in which
            you reside, or another mutually agreeable location, in the English language. The
            arbitrator may award any relief that a court of competent jurisdiction could award,
            including attorneys&apos; fees when authorized by law, and the arbitral decision may be
            enforced in any court. At your request, hearings may be conducted in person or by
            telephone and the arbitrator may provide for submitting and determining motions on
            briefs, without oral hearings. The prevailing party in any action or proceeding to
            enforce this agreement shall be entitled to costs and attorneys&apos; fees. If the
            arbitrator(s) or arbitration administrator would impose filing fees or other
            administrative costs on you, we will reimburse you, upon request, to the extent such
            fees or costs would exceed those that you would otherwise have to pay if you were
            proceeding instead in a court. We will also pay additional fees or costs if required to
            do so by the arbitration administrator&apos;s rules or applicable law. Apart from the
            foregoing, each Party will be responsible for any other fees or costs, such as attorney
            fees that the Party may incur. If a court decides that any provision of this section
            12.2 is invalid or unenforceable, that provision shall be severed and the other parts of
            this section 12.2 shall still apply. In any case, the remainder of this Agreement, will
            continue to apply.
          </Text>

          <Text textDecoration={'underline'}>12.3. Governing law</Text>

          <Text>
            For any dispute not subject to arbitration, you and Midas Labs Ltd. & Midas Labs FZE LLC
            agree to submit to the personal and exclusive jurisdiction and venue in the federal and
            state courts located in Wilmington, Delaware. You further agree to accept service of
            process by mail, and hereby waive any and all jurisdictional and venue defenses
            otherwise available. The terms and the relationship between you and Midas Labs Ltd. &
            Midas Labs FZE LLC shall be governed by the laws of BVI without regard to conflict of
            law provisions.
          </Text>
          <Text fontWeight="bold" size="lg">
            13. General Provisions
          </Text>
          <Text textDecoration={'underline'}>13.1. Entire Agreement</Text>
          <Text>
            These Terms (and any additional terms, rules and conditions of participation that may be
            posted on the Service) constitute the entire agreement with respect to the Service and
            supersedes any prior agreements, oral or written. In the event of a conflict between
            these Terms and the additional terms, rules and conditions of participation, the latter
            will prevail over the Terms to the extent of the conflict.
          </Text>

          <Text textDecoration={'underline'}>13.2. Waiver and Severability of Terms</Text>

          <Text>
            The failure of any entity to exercise or enforce any right or provision of the Terms
            shall not constitute a waiver of such right or provision. If any provision of the Terms
            is found by an arbitrator or court of competent jurisdiction to be invalid, the parties
            nevertheless agree that the arbitrator or court should endeavor to give effect to the
            parties&apos; intentions as reflected in the provision, and the other provisions of the
            Terms remain in full force and effect.
          </Text>

          <Text textDecoration={'underline'}>13.3. Statute of Limitations</Text>
          <Text>
            You agree that regardless of any statute or law to the contrary, any claim or cause of
            action arising out of or related to the use of the Service or the Terms must be filed
            within one (1) year after such claim or cause of action arose or be forever barred.
          </Text>
          <Text textDecoration={'underline'}>13.4. Section Titles</Text>
          <Text>
            The section titles in the Terms are for convenience only and have no legal or
            contractual effect.
          </Text>
          <Text textDecoration={'underline'}>13.5. Communications</Text>
          <Text>
            Users with questions, complaints or claims with respect to the Service may contact us
            using the relevant contact information set forth above and at contact@midaslabsltd.xyz.
          </Text>
          <Text fontWeight="bold" size="lg">
            14. Prohibited Use
          </Text>
          <Text>
            You may not use the Service to engage in the following categories of activity
            (&quot;Prohibited Uses&quot;). The specific types of use listed below are
            representative, but not exhaustive. If you are uncertain as to whether or not your use
            of the Services involves a Prohibited Use, or have questions about how these
            requirements apply to you, please contact us at contact@midaslabsltd.xyz By opening
            using the Service provided here, you confirm that you will not use this Service to do
            any of the following:
            <UnorderedList>
              <ListItem>
                Unlawful Activity: Activity which would violate, or assist in violation of, any law,
                statute, ordinance, or regulation, sanctions programs administered in any relevant
                country, including but not limited to the U.S. Department of Treasury&apos;s Office
                of Foreign Assets Control (&quot;OFAC&quot;), or which would involve proceeds of any
                unlawful activity; publish, distribute or disseminate any unlawful material or
                information
              </ListItem>
              <ListItem>
                Abuse Other Users: Interfere with another individual&apos;s or entity&apos;s access
                to or use of any Services; defame, abuse, extort, harass, stalk, threaten or
                otherwise violate or infringe the legal rights (such as, but not limited to, rights
                of privacy, publicity and intellectual property) of others; incite, threaten,
                facilitate, promote, or encourage hate, racial intolerance, or violent acts against
                others; harvest or otherwise collect information from the Interface about others,
                including without limitation email addresses, without proper consent
              </ListItem>

              <ListItem>
                Fraud: Activity which operates to defraud Midas Labs Ltd. & Midas Labs FZE LLC,
                Ionic Protocol and Interface users, or any other person; provide any false,
                inaccurate, or misleading information.
              </ListItem>

              <ListItem>
                Intellectual Property Infringement: Engage in transactions involving items that
                infringe or violate any copyright, trademark, right of publicity or privacy or any
                other proprietary right under the law, including but not limited to sales,
                distribution, or access to counterfeit music, movies, software, or other licensed
                materials without the appropriate authorization from the rights holder; use of Midas
                Labs Ltd. & Midas Labs FZE LLC intellectual property, name, or logo, including use
                of Midas Labs Ltd. & Midas Labs FZE LLC trade or service marks, without express
                consent from Midas Labs Ltd. & Midas Labs FZE LLC or in a manner that otherwise
                harms Midas Labs Ltd. & Midas Labs FZE LLC; any action that implies an untrue
                endorsement by or affiliation with Midas Labs Ltd. & Midas Labs FZE LLC.
              </ListItem>
            </UnorderedList>
          </Text>
        </Flex>
      }
      footer={
        <>
          <Button id="termsAcceptBtn" onClick={accept} variant={'green'}>
            Accept
          </Button>
          <Button
            ml={'8px'}
            onClick={() => {
              window.location.replace('https://google.com');
            }}
            variant={'gray'}
          >
            Decline
          </Button>
        </>
      }
      header={
        <Flex alignItems="flex-end" mr={8}>
          <Text>Terms & Conditions</Text>
          <Spacer />
          <VStack spacing={0}>
            <Text>Last Revised: </Text>
            <Text>7/16/2022</Text>
          </VStack>
        </Flex>
      }
      isOpen={!hasAcceptedTerms}
      modalBodyProps={{ maxHeight: '60vh', overflowY: 'scroll' }}
      modalHeaderProps={{ alignSelf: 'center', width: '100%' }}
      modalProps={{ size: '6xl' }}
      onClose={accept}
    />
  );
};

export default Terms;
