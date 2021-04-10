<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" 
                xmlns:x="http://www.tei-c.org/ns/1.0"
                xmlns:my="https://github.com/tst-project"
                exclude-result-prefixes="x my">
<xsl:import href="functions.xsl"/>
<xsl:import href="definitions.xsl"/>

<xsl:output method="html" encoding="UTF-8" omit-xml-declaration="yes"/>

<!-- styling -->

<xsl:template match="x:TEI">
    <xsl:element name="html">
        <xsl:element name="head">
            <xsl:element name="meta">
                <xsl:attribute name="charset">utf-8</xsl:attribute>
            </xsl:element>
            <xsl:element name="meta">
                <xsl:attribute name="name">viewport</xsl:attribute>
                <xsl:attribute name="content">width=device-width,initial-scale=1</xsl:attribute>
            </xsl:element>
            <xsl:element name="title">
                <xsl:value-of select="//x:titleStmt/x:title"/>
            </xsl:element>
            <xsl:element name="link">
                <xsl:attribute name="rel">icon</xsl:attribute>
                <xsl:attribute name="type">image/png</xsl:attribute>
                <xsl:attribute name="href">favicon-32.png</xsl:attribute>
            </xsl:element>
            <xsl:element name="link">
                <xsl:attribute name="rel">stylesheet</xsl:attribute>
                <xsl:attribute name="href">../lib/tufte.css</xsl:attribute>
            </xsl:element>
            <xsl:element name="link">
                <xsl:attribute name="rel">stylesheet</xsl:attribute>
                <xsl:attribute name="href">../lib/tst.css</xsl:attribute>
            </xsl:element>
            <xsl:element name="link">
                <xsl:attribute name="rel">stylesheet</xsl:attribute>
                <xsl:attribute name="href">../lib/header.css</xsl:attribute>
            </xsl:element>
            <xsl:element name="link">
                <xsl:attribute name="rel">stylesheet</xsl:attribute>
                <xsl:attribute name="href">../lib/transcription.css</xsl:attribute>
            </xsl:element>
            <xsl:element name="script">
                <xsl:attribute name="type">text/javascript</xsl:attribute>
                <xsl:attribute name="src">../lib/sanscript.js</xsl:attribute>
            </xsl:element>
            <xsl:element name="script">
                <xsl:attribute name="type">text/javascript</xsl:attribute>
                <xsl:attribute name="src">../lib/transliterate.js</xsl:attribute>
            </xsl:element>
            <xsl:element name="script">
                <xsl:attribute name="type">text/javascript</xsl:attribute>
                <xsl:attribute name="src">../lib/viewpos.js</xsl:attribute>
            </xsl:element>
            <xsl:element name="script">
                <xsl:attribute name="type">text/javascript</xsl:attribute>
                <xsl:attribute name="src">../lib/hypher-nojquery.js</xsl:attribute>
            </xsl:element>
            <xsl:element name="script">
                <xsl:attribute name="type">text/javascript</xsl:attribute>
                <xsl:attribute name="src">../lib/sa.js</xsl:attribute>
            </xsl:element>
            <xsl:element name="script">
                <xsl:attribute name="type">text/javascript</xsl:attribute>
                <xsl:attribute name="src">../lib/ta.js</xsl:attribute>
            </xsl:element>
            <xsl:element name="script">
                <xsl:attribute name="type">text/javascript</xsl:attribute>
                <xsl:attribute name="src">../lib/ta-Latn.js</xsl:attribute>
            </xsl:element>
            <xsl:element name="script">
                <xsl:attribute name="type">text/javascript</xsl:attribute>
                <xsl:attribute name="src">https://unpkg.com/mirador@latest</xsl:attribute>
            </xsl:element>
            <xsl:element name="script">
                <xsl:attribute name="type">text/javascript</xsl:attribute>
                <xsl:attribute name="src">../lib/tst.js</xsl:attribute>
            </xsl:element>
            <xsl:element name="script">
                <xsl:attribute name="type">text/javascript</xsl:attribute>
                window.addEventListener('load',window.TSTViewer.init);
            </xsl:element>
        </xsl:element>
        <xsl:element name="body">
            <xsl:attribute name="lang">en</xsl:attribute>   
            <xsl:element name="div">
                <xsl:attribute name="id">recordcontainer</xsl:attribute>
                <xsl:element name="div">
                    <xsl:choose>
                        <xsl:when test="x:facsimile/x:graphic">
                            <xsl:attribute name="id">record-thin</xsl:attribute>
                        </xsl:when>
                        <xsl:otherwise>
                            <xsl:attribute name="id">record-fat</xsl:attribute>
                        </xsl:otherwise>
                    </xsl:choose>
                    <xsl:element name="div">
                        <xsl:attribute name="id">topbar</xsl:attribute>
                        <xsl:element name="div">
                            <xsl:attribute name="id">transbutton</xsl:attribute>
                            <xsl:attribute name="title">change script</xsl:attribute>
                            <xsl:text>A</xsl:text>
                        </xsl:element>
                    </xsl:element>
                    <xsl:element name="article">
                        <xsl:apply-templates/>
                    </xsl:element>
                </xsl:element>
            </xsl:element>
            <xsl:if test="x:facsimile/x:graphic">
                <xsl:element name="div">
                    <xsl:attribute name="id">viewer</xsl:attribute>
                    <xsl:attribute name="data-manifest">
                        <xsl:value-of select="x:facsimile/x:graphic/@url"/>
                    </xsl:attribute>
                </xsl:element>
            </xsl:if>
        </xsl:element>
    </xsl:element>
</xsl:template>

<xsl:template match="x:teiHeader">
    <xsl:element name="section">
        <xsl:call-template name="lang"/>
        <xsl:apply-templates />
    </xsl:element>
</xsl:template>

<xsl:template match="x:milestone">
    <xsl:element name="span">
        <xsl:attribute name="class">milestone</xsl:attribute>
        <xsl:attribute name="lang">en</xsl:attribute>
        <xsl:apply-templates select="@facs"/>
        <xsl:choose>
        <xsl:when test="@unit">
            <xsl:value-of select="@unit"/>
            <xsl:text> </xsl:text>
        </xsl:when>
        <xsl:when test="/x:TEI/x:teiHeader/x:fileDesc/x:sourceDesc/x:msDesc/x:physDesc/x:objectDesc[@form = 'pothi']">
            <xsl:text>folio </xsl:text>
        </xsl:when>
<xsl:when test="/x:TEI/x:teiHeader/x:fileDesc/x:sourceDesc/x:msDesc/x:physDesc/x:objectDesc[@form = 'book']">
            <xsl:text>page </xsl:text>
        </xsl:when>
        </xsl:choose>
<xsl:value-of select="@n"/>
    </xsl:element>
</xsl:template>

<xsl:template match="x:locus">
    <xsl:element name="span">
        <xsl:attribute name="class">
            <xsl:text>locus </xsl:text>
            <xsl:value-of select="@rend"/>
        </xsl:attribute>
        <xsl:apply-templates select="@facs"/>
        <xsl:call-template name="lang"/>
        <xsl:apply-templates/>
    </xsl:element>
</xsl:template>

<xsl:template match="@facs">
    <xsl:attribute name="data-loc">
        <xsl:value-of select="."/>
    </xsl:attribute>
    <xsl:attribute name="data-anno">
        <xsl:text>image </xsl:text>
        <xsl:value-of select="."/>
    </xsl:attribute>
</xsl:template>

<xsl:template match="x:lb">
    <xsl:element name="span">
        <xsl:attribute name="class">lb</xsl:attribute>
        <xsl:attribute name="lang">en</xsl:attribute>
        <xsl:apply-templates select="@n"/>
        <xsl:text>&#x2424;</xsl:text>
    </xsl:element>
</xsl:template>

<xsl:template match="x:lb/@n">
    <xsl:attribute name="data-anno">
        <xsl:text>line </xsl:text>
        <xsl:value-of select="."/>
    </xsl:attribute>
</xsl:template>
<xsl:template match="x:pb/@n">
    <xsl:attribute name="data-anno">
        <xsl:variable name="unit" select="//x:extent/x:measure/@unit"/>
        <xsl:choose>
            <xsl:when test="$unit">
                <xsl:value-of select="$unit"/><xsl:text> </xsl:text>
            </xsl:when>
            <xsl:otherwise>
                <xsl:text>page </xsl:text>
            </xsl:otherwise>
        </xsl:choose>
        <xsl:value-of select="."/>
    </xsl:attribute>
</xsl:template>

<xsl:template match="x:pb">
<xsl:element name="span">
    <xsl:attribute name="class">pb</xsl:attribute>
    <xsl:attribute name="lang">en</xsl:attribute>
    <xsl:apply-templates select="@n"/>
    <xsl:apply-templates select="@facs"/>
    <xsl:text>&#x2424;</xsl:text>
</xsl:element>
</xsl:template>

<xsl:template match="x:sup">
    <xsl:element name="sup">
        <xsl:call-template name="lang"/>
        <xsl:apply-templates />
    </xsl:element>
</xsl:template>

<xsl:template match="x:sub">
    <xsl:element name="sub">
        <xsl:call-template name="lang"/>
        <xsl:apply-templates />
    </xsl:element>
</xsl:template>

<xsl:template match="x:quote | x:q">
    <xsl:element name="span">
        <xsl:call-template name="lang"/>
        <xsl:attribute name="class">quote</xsl:attribute>
        <xsl:apply-templates />
    </xsl:element>
</xsl:template>

<xsl:template match="x:quote[@rend='block']">
    <xsl:element name="blockquote">
        <xsl:call-template name="lang"/>
        <xsl:apply-templates />
    </xsl:element>
</xsl:template>

<xsl:template match="x:foreign">
    <xsl:element name="em">
        <xsl:call-template name="lang"/>
        <xsl:apply-templates />
    </xsl:element>
</xsl:template>

<xsl:template match="x:term">
    <xsl:element name="span">
        <xsl:call-template name="lang"/>
        <xsl:attribute name="class">
            <xsl:text>term </xsl:text>
            <xsl:value-of select="@rend"/>
        </xsl:attribute>
        <xsl:apply-templates />
    </xsl:element>
</xsl:template>

<xsl:template match="x:titleStmt/x:title">
    <xsl:element name="h1">
        <xsl:call-template name="lang"/>
        <xsl:apply-templates/>
    </xsl:element>
</xsl:template>

<!--xsl:template match="x:titleStmt/x:editor">
    <h4>Edited by <xsl:apply-templates/></h4>
</xsl:template-->

<xsl:template match="x:titleStmt/x:respStmt">
    <p><xsl:apply-templates/></p>
</xsl:template>

<xsl:template match="x:respStmt/x:resp">
    <xsl:apply-templates/>
</xsl:template>

<xsl:template match="x:respStmt/x:name">
    <xsl:apply-templates/>
</xsl:template>

<xsl:template match="x:publicationStmt">
    <xsl:element name="p">
        <xsl:text>Published in </xsl:text>
        <xsl:apply-templates select="x:date"/>
        <xsl:text> by </xsl:text>
        <xsl:apply-templates select="x:publisher"/> 
        <xsl:if test="x:pubPlace">
            <xsl:text>in </xsl:text><xsl:apply-templates select="x:pubPlace"/>
        </xsl:if>
        <xsl:text>.</xsl:text>
    </xsl:element>
</xsl:template>

<xsl:template match="x:editionStmt">
    <xsl:element name="div">
        <xsl:attribute name="class">editionStmt</xsl:attribute>
        <xsl:apply-templates/>
    </xsl:element>
</xsl:template>

<xsl:template match="x:title">
    <xsl:element name="em">
        <xsl:attribute name="class">title</xsl:attribute>
        <xsl:call-template name="lang"/>
        <xsl:apply-templates />
    </xsl:element>
</xsl:template>

<xsl:template match="x:title[@type='article']">
    <xsl:element name="em">
        <xsl:attribute name="class">title-article</xsl:attribute>
        <xsl:call-template name="lang"/>
        <xsl:apply-templates />
    </xsl:element>
</xsl:template>

<xsl:template match="x:msContents/x:summary/x:title">
    <xsl:element name="em">
        <xsl:call-template name="lang"/>
        <xsl:apply-templates/>
    </xsl:element>
</xsl:template>

<xsl:template match="x:msContents/x:summary/x:sub">
    <xsl:element name="sub">
        <xsl:apply-templates/>
    </xsl:element>
</xsl:template>
<xsl:template match="x:msContents/x:summary/x:sup">
    <xsl:element name="sup">
        <xsl:apply-templates/>
    </xsl:element>
</xsl:template>

<xsl:template match="x:msIdentifier">
    <table id="msidentifier">
        <xsl:apply-templates select="x:repository"/>
        <xsl:apply-templates select="x:institution"/>
        <xsl:apply-templates select="x:idno"/>
    </table>
</xsl:template>

<xsl:template match="x:repository">
    <tr><td colspan="2"><xsl:apply-templates/></td></tr>
</xsl:template>
<xsl:template match="x:institution">
    <tr><td colspan="2"><xsl:apply-templates/></td></tr>
</xsl:template>
<xsl:template match="x:orgName">
    <xsl:element name="span">
        <xsl:attribute name="class">orgname</xsl:attribute>
        <xsl:call-template name="lang"/>
        <xsl:apply-templates/>
    </xsl:element>
</xsl:template>

<xsl:template match="x:idno[not(@type='URI')]">
    <xsl:if test="node()">
        <tr><th>
            <xsl:if test="@type">
                <xsl:value-of select="@type"/>
            </xsl:if>
            </th>
            <td>
                <xsl:apply-templates/>
            </td>
        </tr>
    </xsl:if>
</xsl:template>
<xsl:template match="x:idno[@type='URI']">
    <tr><td colspan="2">
        <xsl:element name="a">
            <xsl:attribute name="href"><xsl:value-of select="."/></xsl:attribute>
            <xsl:apply-templates/>
        </xsl:element>
    </td></tr>
</xsl:template>

<xsl:template match="x:fileDesc">
    <xsl:apply-templates/>
</xsl:template>
<xsl:template match="x:titleStmt">
    <xsl:apply-templates/>
</xsl:template>
<xsl:template match="x:sourceDesc">
    <xsl:apply-templates/>
</xsl:template>

<xsl:template name="msDescTemplate">
    <xsl:apply-templates select="x:head"/>
    <xsl:apply-templates select="x:msIdentifier"/>
    <xsl:apply-templates select="x:msContents"/>
    <xsl:apply-templates select="x:physDesc"/>
    <section>
        <h3>Contents</h3>
        <xsl:apply-templates select="x:msContents/@class"/>
        <xsl:apply-templates select="x:msContents/x:msItem"/>
        <xsl:apply-templates select="x:msPart"/>
        <xsl:if test="x:msPart">
            <hr/>
        </xsl:if>
    </section>
    <xsl:apply-templates select="x:history"/>
    <xsl:apply-templates select="x:additional"/>
</xsl:template>

<xsl:template match="x:msDesc">
    <xsl:call-template name="msDescTemplate"/>
</xsl:template>

<xsl:template match="x:msPart">
    <hr/>
    <section class="mspart">
        <xsl:call-template name="msDescTemplate"/>
    </section>
</xsl:template>

<xsl:template match="x:msPart/x:head">
    <h4 class="mspart"><xsl:apply-templates/></h4>
</xsl:template>

<xsl:template match="x:msContents">
    <xsl:apply-templates select="x:summary"/>
</xsl:template>

<xsl:template match="x:msContents/@class">
    <xsl:variable name="class" select="."/>
    <xsl:element name="p">
        <xsl:value-of select="$defRoot//my:mstypes/my:entry[@key=$class]"/>
        <xsl:text>.</xsl:text>
    </xsl:element>
</xsl:template>

<xsl:template name="msItemHeader">
    <xsl:element name="thead">
        <xsl:element name="tr">
            <xsl:element name="th">
                <xsl:attribute name="colspan">2</xsl:attribute>
                <xsl:attribute name="class">left-align</xsl:attribute>
                <xsl:value-of select="@n"/>
                <xsl:variable name="thisid" select="@xml:id"/>
                <xsl:choose>
                    <xsl:when test="$thisid">
                        <xsl:if test="@n">
                            <xsl:text>, </xsl:text>
                        </xsl:if>
                        <xsl:choose>
                            <xsl:when test="//x:TEI/x:text[@corresp=concat('#',$thisid)]">
                                <xsl:element name="a">
                                    <xsl:attribute name="class">local</xsl:attribute>
                                    <xsl:attribute name="href">
                                        <xsl:text>#text-</xsl:text>
                                        <xsl:value-of select="@xml:id"/>
                                    </xsl:attribute>
                                    <xsl:attribute name="data-scroll"/>
                                    <xsl:value-of select="@xml:id"/>
                                </xsl:element>
                            </xsl:when>
                            <xsl:otherwise>
                            <xsl:value-of select="@xml:id"/>
                            </xsl:otherwise>
                        </xsl:choose>
                        <xsl:choose>
                            <xsl:when test="@defective = 'false'">
                                <xsl:text> (complete)</xsl:text>
                            </xsl:when>
                            <xsl:when test="@defective = 'true'">
                                <xsl:text> (incomplete)</xsl:text>
                            </xsl:when>
                            <xsl:otherwise/>
                        </xsl:choose>
                    </xsl:when>
                    <xsl:otherwise>
                        <xsl:if test="@n">
                            <xsl:text> </xsl:text>
                        </xsl:if>
                        <xsl:choose>
                            <xsl:when test="@defective = 'false'">
                                <xsl:text>(complete)</xsl:text>
                            </xsl:when>
                            <xsl:when test="@defective = 'true'">
                                <xsl:text>(incomplete)</xsl:text>
                            </xsl:when>
                            <xsl:otherwise/>
                        </xsl:choose>
                    </xsl:otherwise>
                </xsl:choose>
            </xsl:element>
        </xsl:element>
    </xsl:element>
</xsl:template>

<xsl:template name="itemrow">
    <xsl:param name="header"/>
    <tr>
      <th><xsl:value-of select="$header"/></th>
        <xsl:element name="td">
            <xsl:call-template name="lang"/>
            <xsl:apply-templates select="."/>
        </xsl:element>
    </tr>
</xsl:template>

<xsl:template name="excerpt">
     <xsl:param name="mainlang"/>
     <xsl:param name="xmllang"/>
     <xsl:param name="header"/>    
     <tr>
        <th><xsl:value-of select="$header"/></th>
        <td>
            <xsl:attribute name="class">excerpt</xsl:attribute>
            <xsl:attribute name="lang">
                <xsl:choose>
                    <xsl:when test="$xmllang">
                        <xsl:value-of select="$xmllang"/>
                    </xsl:when>
                    <xsl:when test="$mainlang">
                        <xsl:value-of select="$mainlang"/>
                    </xsl:when>
                    <xsl:otherwise/>
                </xsl:choose>
            </xsl:attribute>
            <xsl:apply-templates/>
        </td>
     </tr>
</xsl:template>

<xsl:template match="x:msItem">
  <table class="msItem">
    <xsl:variable name="thisid" select="@xml:id"/>
    <xsl:call-template name="msItemHeader"/>
    <!--xsl:apply-templates/-->
    <xsl:for-each select="x:title">
        <xsl:call-template name="itemrow">
            <xsl:with-param name="header">Title</xsl:with-param>
        </xsl:call-template>
    </xsl:for-each>
    <xsl:for-each select="x:author">
        <xsl:call-template name="itemrow">
            <xsl:with-param name="header">Author</xsl:with-param>
        </xsl:call-template>
    </xsl:for-each>
    <xsl:apply-templates select="x:textLang"/>
    <xsl:apply-templates select="x:filiation"/>
    <xsl:variable name="mainlang" select="substring(x:textLang/@mainLang,1,2)"/>
    <xsl:for-each select="x:rubric | //x:text[@corresp=concat('#',$thisid)]//x:seg[@function='rubric']">
         <xsl:call-template name="excerpt">
            <xsl:with-param name="header">Rubric</xsl:with-param>
            <xsl:with-param name="xmllang" select="@xml:lang"/>
            <xsl:with-param name="mainlang" select="$mainlang"/>
        </xsl:call-template>
    </xsl:for-each>
    <xsl:for-each select="x:incipit | //x:text[@corresp=concat('#',$thisid)]//x:seg[@function='incipit']">
         <xsl:call-template name="excerpt">
            <xsl:with-param name="header">Incipit</xsl:with-param>
            <xsl:with-param name="xmllang" select="@xml:lang"/>
            <xsl:with-param name="mainlang" select="$mainlang"/>
        </xsl:call-template>
    </xsl:for-each>
    <xsl:for-each select="x:explicit | //x:text[@corresp=concat('#',$thisid)]//x:seg[@function='explicit']">
         <xsl:call-template name="excerpt">
            <xsl:with-param name="header">Explicit</xsl:with-param>
            <xsl:with-param name="xmllang" select="@xml:lang"/>
            <xsl:with-param name="mainlang" select="$mainlang"/>
        </xsl:call-template>
    </xsl:for-each>
    <xsl:for-each select="x:finalRubric | //x:text[@corresp=concat('#',$thisid)]//x:seg[@function='completion-statement']">
         <xsl:call-template name="excerpt">
            <xsl:with-param name="header">Completion statement</xsl:with-param>
            <xsl:with-param name="xmllang" select="@xml:lang"/>
            <xsl:with-param name="mainlang" select="$mainlang"/>
         </xsl:call-template>
    </xsl:for-each>
    <xsl:for-each select="x:colophon | //x:text[@corresp=concat('#',$thisid)]//x:seg[@function='colophon']">
         <xsl:call-template name="excerpt">
            <xsl:with-param name="header">Colophon</xsl:with-param>
            <xsl:with-param name="xmllang" select="@xml:lang"/>
            <xsl:with-param name="mainlang" select="$mainlang"/>
         </xsl:call-template>
    </xsl:for-each>
  </table>
  <xsl:if test="not(position() = last())">
    <xsl:element name="hr"/>
  </xsl:if>
</xsl:template>

<xsl:template match="x:msItem/x:title">
    <xsl:apply-templates/>
</xsl:template>
<!--xsl:template match="x:msItem/x:title[not(@type)]">
    <tr>
      <th>Title</th>
        <xsl:element name="td">
            <xsl:call-template name="lang"/>
            <xsl:apply-templates />
        </xsl:element>
    </tr>
</xsl:template>

<xsl:template match="x:msItem/x:title[@type='commentary']">
  <tr>
    <th>Commentary</th>
    <xsl:element name="td">
        <xsl:call-template name="lang"/>
        <xsl:apply-templates />
    </xsl:element>
  </tr>
</xsl:template>

<xsl:template match="x:msItem/x:author">
  <tr>
    <th>Author</th>
    <xsl:element name="td">
        <xsl:call-template name="lang"/>
        <xsl:apply-templates />
    </xsl:element>
  </tr>
</xsl:template>
<xsl:template match="x:msItem/x:author[@role='commentator']">
  <tr>
    <th>Commentator</th>
    <xsl:element name="td">
        <xsl:call-template name="lang"/>
        <xsl:apply-templates />
    </xsl:element>
  </tr>
</xsl:template-->

<xsl:template match="x:textLang">
    <tr>
        <th>Language</th>
        <xsl:element name="td">
            <xsl:variable name="mainLang" select="@mainLang"/>
            <xsl:attribute name="class">record_languages</xsl:attribute>
            <xsl:attribute name="data-mainlang"><xsl:value-of select="$mainLang"/></xsl:attribute>
            <xsl:attribute name="data-otherlangs"><xsl:value-of select="@otherLangs"/></xsl:attribute>
            <xsl:value-of select="$defRoot//my:langs/my:entry[@key=$mainLang]"/>
            <xsl:if test="@otherLangs and not(@otherLangs='')">
                <xsl:text> (</xsl:text>
                <xsl:call-template name="splitlist">
                    <xsl:with-param name="list" select="@otherLangs"/>
                    <xsl:with-param name="nocapitalize">true</xsl:with-param>
                    <xsl:with-param name="map">my:langs</xsl:with-param>
                </xsl:call-template>
                <xsl:text>)</xsl:text>
            </xsl:if>
        </xsl:element>
    </tr>
</xsl:template>

<xsl:template match="x:msItem//x:note">
    <xsl:element name="p">
        <xsl:call-template name="lang"/>
        <xsl:apply-templates/>
    </xsl:element>
</xsl:template>

<xsl:template match="x:span">
    <xsl:element name="span">
        <xsl:call-template name="lang"/>
        <xsl:apply-templates/>
    </xsl:element>
</xsl:template>

<xsl:template match="x:filiation">
    <tr>
        <th>Other manuscript testimonies</th>
        <xsl:element name="td">
            <xsl:apply-templates/>
        </xsl:element>
    </tr>
</xsl:template>

<xsl:template match="x:summary">
    <xsl:element name="section">
        <xsl:attribute name="id">summary</xsl:attribute>
        <xsl:call-template name="lang"/>
        <xsl:choose>
            <xsl:when test="x:p">
                <xsl:apply-templates/>
            </xsl:when>
            <xsl:otherwise>
                <xsl:element name="p">
                    <xsl:apply-templates/>
                </xsl:element>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:element>
</xsl:template>

<xsl:template match="x:physDesc">
  <section>
      <h3>Physical description</h3>
      <table id="physDesc">
      <xsl:apply-templates select="x:objectDesc/@form"/>
      <xsl:apply-templates select="x:objectDesc/x:supportDesc/@material"/>
      <xsl:apply-templates select="x:objectDesc/x:supportDesc/x:extent"/>
      <xsl:if test="x:objectDesc/x:supportDesc/x:foliation">
          <tr>
            <th>Foliation</th>
            <td><ul>
              <xsl:apply-templates select="x:objectDesc/x:supportDesc/x:foliation"/>
            </ul></td>
          </tr>
      </xsl:if>
      <xsl:apply-templates select="x:objectDesc/x:supportDesc/x:condition"/>
      <xsl:apply-templates select="x:objectDesc/x:layoutDesc"/>
      <xsl:apply-templates select="x:handDesc"/>
      <xsl:apply-templates select="x:decoDesc"/>
      <xsl:apply-templates select="x:additions"/>
      <xsl:apply-templates select="x:bindingDesc"/>
      </table>
  </section>
</xsl:template>

<xsl:template match="x:scriptDesc">
    <ul>
    <xsl:apply-templates select="x:scriptNote"/>
    </ul>
</xsl:template>
<xsl:template match="x:scriptNote">
      <li><xsl:apply-templates/></li>
</xsl:template>

<xsl:template match="x:objectDesc/@form">
  <tr>
    <th>Format</th> <td><xsl:call-template name="capitalize"><xsl:with-param name="str" select="."/></xsl:call-template></td>
  </tr>
</xsl:template>

<xsl:template match="x:objectDesc/x:supportDesc/@material">
  <xsl:variable name="mat" select="."/>
  <xsl:element name="tr">
    <xsl:element name="th">Material</xsl:element>
    <xsl:element name="td">
        <xsl:value-of select="$defRoot//my:materials/my:entry[@key=$mat]"/>
        <xsl:if test="../x:support">
            <xsl:text>. </xsl:text>
            <xsl:apply-templates select="../x:support"/>
        </xsl:if>
    </xsl:element>
  </xsl:element>
</xsl:template>

<xsl:template match="x:objectDesc/x:supportDesc/x:support">
    <xsl:apply-templates/>
</xsl:template>

<xsl:template match="x:measure">
    <xsl:value-of select="@quantity"/>
    <xsl:text> </xsl:text>
    <xsl:value-of select="@unit"/>
    <xsl:text>. </xsl:text>
    <xsl:apply-templates />
</xsl:template>

<xsl:template match="x:measure[@unit='stringhole' or @unit='folio' or @unit='page']">
    <xsl:if test="@quantity and not(@quantity = '') and not(@quantity = '0')">
        <xsl:call-template name="units"/>
        <xsl:text>. </xsl:text>
        <xsl:apply-templates />
   </xsl:if>
</xsl:template>

<xsl:template match="x:objectDesc/x:supportDesc/x:extent">
  <tr>
    <th>Extent</th> 
    <td>
        <xsl:apply-templates select="x:measure"/>
    </td>
  </tr>
  <tr>
    <th>Dimensions</th>
    <td>
        <xsl:apply-templates select="x:dimensions"/>
    </td>
  </tr>
</xsl:template>

<xsl:template match="x:dimensions">
    <ul>
        <xsl:choose>
        <xsl:when test="@type">
            <li>
                <span class="type"><xsl:value-of select="@type"/></span>
                <ul>
                    <xsl:apply-templates select="x:width"/>
                    <xsl:apply-templates select="x:height"/>
                    <xsl:apply-templates select="x:depth"/>
                </ul>
            </li>
        </xsl:when>
        <xsl:otherwise>
            <xsl:apply-templates select="x:width"/>
            <xsl:apply-templates select="x:height"/>
            <xsl:apply-templates select="x:depth"/>
        </xsl:otherwise>
        </xsl:choose>
    </ul>
    <xsl:apply-templates select="x:note"/>
</xsl:template>

<xsl:template match="x:dimensions/x:note">
    <xsl:element name="p">
        <xsl:call-template name="lang"/>
        <xsl:apply-templates/>
    </xsl:element>
</xsl:template>

<xsl:template match="x:width">
    <xsl:element name="li">
        <xsl:text>width: </xsl:text>
        <xsl:apply-templates select="@quantity"/>
        <xsl:call-template name="min-max"/>
        <xsl:if test="@quantity"><xsl:value-of select="../@unit"/></xsl:if>
    </xsl:element>
</xsl:template>
<xsl:template match="x:height">
    <xsl:element name="li">
        <xsl:text>height: </xsl:text>
        <xsl:apply-templates select="@quantity"/>
        <xsl:call-template name="min-max"/>
        <xsl:if test="@quantity"><xsl:value-of select="../@unit"/></xsl:if>
    </xsl:element>
</xsl:template>
<xsl:template match="x:depth">
    <xsl:element name="li">
        <xsl:text>depth: </xsl:text>
        <xsl:apply-templates select="@quantity"/>
        <xsl:call-template name="min-max"/>
        <xsl:if test="@quantity"><xsl:value-of select="../@unit"/></xsl:if>
    </xsl:element>
</xsl:template>

<xsl:template match="@quantity">
    <xsl:value-of select="."/>
    <xsl:text> </xsl:text>
</xsl:template>
<xsl:template match="@min">
    <xsl:text>min. </xsl:text>
    <xsl:value-of select="."/>
    <xsl:text> </xsl:text>
</xsl:template>
<xsl:template match="@max">
    <xsl:text>max. </xsl:text>
    <xsl:value-of select="."/>
</xsl:template>

<xsl:template match="x:objectDesc/x:supportDesc/x:foliation">
    <li>
        <xsl:if test="@n">
            <xsl:call-template name="n-format"/>
            <xsl:text>: </xsl:text>
        </xsl:if>
        <xsl:apply-templates />
    </li>
</xsl:template>

<xsl:template match="x:objectDesc/x:supportDesc/x:condition">
    <tr>
      <th>Condition</th>
      <xsl:element name="td">
        <xsl:call-template name="lang"/>
        <xsl:apply-templates/>
      </xsl:element>
    </tr>
</xsl:template>

<xsl:template match="x:objectDesc/x:layoutDesc">
  <tr>
    <th>Layout</th> 
    <td>
        <ul>
            <xsl:apply-templates/>
        </ul>
    </td>
  </tr>
</xsl:template>

<xsl:template match="x:layout">
    <xsl:if test="node()">
        <li>
          <xsl:if test="@n">
            <xsl:element name="span">
                <xsl:attribute name="class">lihead</xsl:attribute>
                <xsl:value-of select="@n"/>
                <xsl:text>: </xsl:text>
            </xsl:element>
          </xsl:if>
          <xsl:if test="@style and not(@style='')">
          <xsl:call-template name="capitalize">
            <xsl:with-param name="str" select="@style"/>
          </xsl:call-template>
          <xsl:text>. </xsl:text>
          </xsl:if>
          <xsl:if test="@columns and not(@columns='')">
            <xsl:variable name="q" select="translate(@columns,' ','-')"/>
            <xsl:call-template name="units">
                <xsl:with-param name="u">column</xsl:with-param>
                <xsl:with-param name="q" select="$q"/>
            </xsl:call-template>
            <xsl:text>. </xsl:text>
          </xsl:if>
          <xsl:if test="@streams and not(@streams='')">
            <xsl:variable name="q" select="translate(@streams,' ','-')"/>
            <xsl:call-template name="units">
                <xsl:with-param name="u">stream</xsl:with-param>
                <xsl:with-param name="q" select="$q"/>
            </xsl:call-template>
            <xsl:text>. </xsl:text>
          </xsl:if>
          <xsl:if test="@writtenLines and not(@writtenLines='')">
            <xsl:value-of select="translate(@writtenLines,' ','-')"/>
            <xsl:text> written lines per page. </xsl:text>
          </xsl:if>
          <xsl:if test="@ruledLines and not(@ruledLines='')">
            <xsl:value-of select="translate(@ruledLines,' ','-')"/>
            <xsl:text> ruled lines per page. </xsl:text>
          </xsl:if>
          <xsl:apply-templates />
        </li>
    </xsl:if>
</xsl:template>

<xsl:template match="x:handDesc">
    <tr>
      <th>Scribal Hands</th>
      <td><ul>
        <xsl:apply-templates select="x:handNote"/>
      </ul></td>
    </tr>
</xsl:template>
<xsl:template match="x:decoDesc">
    <tr>
      <th>Decorations &amp; Illustrations</th>
      <td><ul>
        <xsl:apply-templates select="x:decoNote"/>
      </ul></td>
    </tr>
</xsl:template>

<xsl:template match="x:decoNote">
  <li>  
    <xsl:element name="span">
        <xsl:attribute name="class">type</xsl:attribute>
        <xsl:variable name="type" select="@type"/>
        <xsl:value-of select="$defRoot//my:decotype/my:entry[@key=$type]"/>
        <xsl:if test="@subtype">
            <xsl:text> (</xsl:text>
            <xsl:variable name="subtype" select="@subtype"/>
            <xsl:call-template name="splitlist">
                <xsl:with-param name="list" select="@subtype"/>
                <xsl:with-param name="nocapitalize">true</xsl:with-param>
                <xsl:with-param name="map">my:subtype</xsl:with-param>
            </xsl:call-template>
            <xsl:text>)</xsl:text>
        </xsl:if>
    </xsl:element>
    <xsl:if test="normalize-space(.) != ''">
        <ul>
            <li>
                <xsl:apply-templates/>
            </li>
        </ul>
    </xsl:if>
  </li>
</xsl:template>
<xsl:template match="x:decoNote/x:desc">
    <xsl:element name="ul">
        <xsl:element name="li">
            <xsl:call-template name="lang"/>
            <xsl:apply-templates/>
        </xsl:element>
    </xsl:element>
</xsl:template>

<xsl:template match="x:handNote">
  <xsl:variable name="script" select="@script"/>
  <xsl:element name="li">  
    <xsl:attribute name="class">record_scripts</xsl:attribute>
    <xsl:attribute name="data-script"><xsl:value-of select="$script"/></xsl:attribute>
    <xsl:call-template name="n-format"/>
    <xsl:text> (</xsl:text><xsl:value-of select="@scope"/><xsl:text>) </xsl:text>
    <xsl:apply-templates select="@scribeRef"/>
    
    <xsl:element name="ul">
        <xsl:element name="li">
            <xsl:call-template name="splitlist">    
                <xsl:with-param name="list" select="@script"/>
            </xsl:call-template>
            <xsl:text> script</xsl:text>
            
            <xsl:if test="@scriptRef and not(@scriptRef='')">
                <xsl:text>: </xsl:text>
                <xsl:call-template name="splitlist">
                    <xsl:with-param name="list" select="@scriptRef"/>
                    <xsl:with-param name="nocapitalize">true</xsl:with-param>
                    <xsl:with-param name="map">my:scriptRef</xsl:with-param>
                </xsl:call-template>
            </xsl:if>
            <xsl:text>.</xsl:text>

            <xsl:if test="@medium and not(@medium='')">
                <xsl:text> </xsl:text>
                <xsl:variable name="donelist">
                    <xsl:call-template name="splitlist">
                        <xsl:with-param name="list" select="@medium"/>
                        <xsl:with-param name="nocapitalize">true</xsl:with-param>
                        <xsl:with-param name="map">my:media</xsl:with-param>
                    </xsl:call-template>
                </xsl:variable>
                <xsl:call-template name="capitalize">
                    <xsl:with-param name="str" select="$donelist"/>
                </xsl:call-template>
                <xsl:text>.</xsl:text>
            </xsl:if>
        </xsl:element>
    </xsl:element>
    <xsl:apply-templates/>
  </xsl:element>
</xsl:template>

<xsl:template match="x:handNote/@scribeRef">
    <xsl:if test="not(. = '')">
        <xsl:variable name="scribe" select="."/>
        <xsl:value-of select="$defRoot//my:scribes/my:entry[@key=$scribe]"/>
        <xsl:text>. </xsl:text>
    </xsl:if>
</xsl:template>

<xsl:template match="x:handNote/x:p">
    <ul><li><xsl:apply-templates/></li></ul>
</xsl:template>

<xsl:template match="x:handNote/x:desc">
    <xsl:element name="ul">
        <xsl:element name="li">
            <xsl:call-template name="lang"/>
            <xsl:apply-templates/>
        </xsl:element>
    </xsl:element>
</xsl:template>

<xsl:template match="x:additions">
  <tr>
    <th>Paratexts</th>
    <td>
        <ul>
          <xsl:apply-templates />
        </ul>
    </td>
  </tr>
</xsl:template>
<xsl:template match="x:additions/x:p">
    <li><xsl:apply-templates /></li>
</xsl:template>

<xsl:template match="x:additions/x:desc">
    <li> 
        <xsl:element name="span">
            <xsl:attribute name="class">type</xsl:attribute>
            <xsl:variable name="type" select="@type"/>
            <xsl:if test="@type">
                <xsl:call-template name="splitlist">
                        <xsl:with-param name="list" select="@type"/>
                        <xsl:with-param name="nocapitalize">true</xsl:with-param>
                        <xsl:with-param name="map">my:additiontype</xsl:with-param>
                </xsl:call-template>
            </xsl:if>
            <xsl:if test="@subtype">
                <xsl:text> (</xsl:text>
                <xsl:call-template name="splitlist">
                    <xsl:with-param name="list" select="@subtype"/>
                    <xsl:with-param name="nocapitalize">true</xsl:with-param>
                    <xsl:with-param name="map">my:subtype</xsl:with-param>
                </xsl:call-template>
                <xsl:text>)</xsl:text>
            </xsl:if>
        </xsl:element>
        <xsl:if test="normalize-space(.) != ''">
            <ul>
                <li>
                    <xsl:apply-templates/>
                </li>
            </ul>
        </xsl:if>
    </li>
</xsl:template>

<xsl:template match="x:bindingDesc">
    <tr>
        <th>Binding</th>
        <td>
            <xsl:apply-templates/>
        </td>
    </tr>
</xsl:template>

<xsl:template match="x:binding">
    <p><xsl:apply-templates/></p>
</xsl:template>
<xsl:template match="x:binding/x:p">
    <xsl:apply-templates/>
</xsl:template>

<xsl:template match="x:origin/x:origDate">
    <xsl:if test="@when or @notBefore or @notAfter or node()">
        <tr>
            <th>Date of production</th>
            <td><xsl:apply-templates /></td>
        </tr>
    </xsl:if>
</xsl:template>
<xsl:template match="x:history">
    <section>
    <h3>History</h3>
    <table id="history">
        <xsl:apply-templates select="x:origin/x:origDate"/>
        <xsl:if test="x:origin/x:origPlace">
        <tr>
            <th>Place of origin</th>
            <td><xsl:apply-templates select="x:origin/x:origPlace"/></td>
        </tr>
        </xsl:if>
        <xsl:if test="x:provenance">
            <tr>
                <th>Provenance</th>
                <td><xsl:apply-templates select="x:provenance"/></td>
            </tr>
        </xsl:if>
        <xsl:if test="x:acquisition">
            <tr>
                <th>Acquisition</th>
                <td><xsl:apply-templates select="x:acquisition"/></td>
            </tr>
        </xsl:if>
    </table>
    </section>
</xsl:template>

<xsl:template match="x:listBibl">
    <h3>Bibliography</h3>
    <xsl:apply-templates/>
</xsl:template>
<xsl:template match="x:bibl">
    <xsl:element name="p">
        <xsl:attribute name="class">bibliography</xsl:attribute>
        <xsl:apply-templates/>
    </xsl:element>
</xsl:template>

<xsl:template match="x:emph">
    <xsl:element name="em">
        <xsl:attribute name="class">
            <xsl:value-of select="@rend"/>
        </xsl:attribute>
        <xsl:call-template name="lang"/>
        <xsl:apply-templates/>
    </xsl:element>
</xsl:template>

<xsl:template match="x:lg">
    <xsl:element name="div">
        <xsl:attribute name="class">lg</xsl:attribute>
        <xsl:call-template name="lang"/>
        <xsl:apply-templates/>
    </xsl:element>
</xsl:template>

<xsl:template match="x:l">
    <xsl:element name="div">
        <xsl:call-template name="lang"/>
        <xsl:attribute name="class">l</xsl:attribute>
        <xsl:apply-templates/>
    </xsl:element>
</xsl:template>

<xsl:template match="x:additional">
    <xsl:apply-templates/>
</xsl:template>

<xsl:template match="x:encodingDesc">
    <h3>Encoding conventions</h3>
    <xsl:apply-templates/>
</xsl:template>

<xsl:template match="x:profileDesc"/>

<xsl:template match="x:revisionDesc">
    <section>
        <h3>Revision history</h3>
        <xsl:element name="table">
            <xsl:apply-templates/>
        </xsl:element>
    </section>
</xsl:template>

<xsl:template match="x:revisionDesc/x:change">
    <xsl:element name="tr">
        <xsl:element name="th">
            <xsl:attribute name="class">when</xsl:attribute>
            <xsl:value-of select="@when"/>
        </xsl:element>
        <xsl:element name="td">
            <xsl:apply-templates/>
        </xsl:element>
    </xsl:element>
</xsl:template>

<xsl:template match="x:facsimile"/>

<xsl:template match="x:text">
    <xsl:variable name="textid" select="substring-after(@corresp,'#')"/>
    <xsl:element name="hr">
        <xsl:attribute name="id">
            <xsl:text>text-</xsl:text>
            <xsl:value-of select="$textid"/>
        </xsl:attribute>
    </xsl:element>
    <xsl:element name="section">
        <xsl:attribute name="class">teitext</xsl:attribute>
        <xsl:call-template name="lang"/>
        <xsl:element name="table">
            <xsl:attribute name="class">texttitle</xsl:attribute>
            <xsl:element name="tr">
                <xsl:element name="td">
                    <xsl:variable name="title" select="//x:msItem[@xml:id=$textid]/x:title"/>
                    <xsl:attribute name="lang"><xsl:value-of select="$title/@xml:lang"/></xsl:attribute>
                    <xsl:apply-templates select="$title"/>
                </xsl:element>
                <xsl:element name="td">
                    <xsl:attribute name="style">text-align: right;</xsl:attribute>
                    <xsl:attribute name="lang">en</xsl:attribute>
                    <xsl:value-of select="@n"/>
                    <xsl:if test="@n and $textid">
                        <xsl:text>, </xsl:text>
                    </xsl:if>
                    <xsl:value-of select="$textid"/>
                </xsl:element>
            </xsl:element>
        </xsl:element>
        <xsl:apply-templates/>
    </xsl:element>
</xsl:template>

<xsl:template match="x:text/@n">
    <xsl:element name="h2">
        <xsl:attribute name="lang">en</xsl:attribute>
        <xsl:value-of select="."/>
    </xsl:element>
</xsl:template>

<xsl:template match="x:text/x:body">
    <xsl:apply-templates/>
</xsl:template>

<xsl:template match="x:ref">
    <xsl:element name="a">
        <xsl:attribute name="href"><xsl:value-of select="@target"/></xsl:attribute>
        <xsl:if test="substring(@target,1,1) = '#'">
            <xsl:attribute name="class">local</xsl:attribute>
        </xsl:if>
        <xsl:apply-templates/>
    </xsl:element>
</xsl:template>

<xsl:template match="x:p">
    <xsl:element name="p">
        <xsl:call-template name="lang"/>
        <xsl:apply-templates/>
    </xsl:element>
</xsl:template>

<xsl:template match="x:material">
    <xsl:element name="span">
        <xsl:attribute name="class">material</xsl:attribute>
        <xsl:apply-templates/>
    </xsl:element>
</xsl:template>

<xsl:template match="x:persName">
    <xsl:element name="span">
        <xsl:attribute name="class">persname</xsl:attribute>
        <xsl:call-template name="lang"/>
        <xsl:apply-templates/>
    </xsl:element>
</xsl:template>

<xsl:template match="x:geogName">
    <xsl:element name="span">
        <xsl:attribute name="class">geogname</xsl:attribute>
        <xsl:call-template name="lang"/>
        <xsl:apply-templates/>
    </xsl:element>
</xsl:template>

<xsl:template match="x:sourceDoc"/>

<!-- transcription styling -->

<xsl:template match="x:del">
    <xsl:variable name="rend" select="@rend"/>
    <xsl:element name="del">
        <xsl:attribute name="data-anno">
            <xsl:text>deleted</xsl:text>
            <xsl:if test="string($rend)">
                <xsl:text> (</xsl:text>
                <xsl:value-of select="$rend"/>
                <xsl:text>)</xsl:text>
           </xsl:if>
        </xsl:attribute>
        <xsl:apply-templates/>
    </xsl:element>
</xsl:template>

<xsl:template match="x:add">
    <xsl:element name="ins">
        <xsl:attribute name="class">add</xsl:attribute>
        <xsl:attribute name="data-anno">
            <xsl:text>inserted</xsl:text>
            <xsl:if test="@place"> (<xsl:value-of select="@place"/>)</xsl:if>
            <xsl:if test="@rend"> (<xsl:value-of select="@rend"/>)</xsl:if>
        </xsl:attribute>
        <xsl:apply-templates />
    </xsl:element>
</xsl:template>

<xsl:template match="x:subst">
    <xsl:element name="span">
    <xsl:attribute name="class">subst</xsl:attribute>
    <xsl:attribute name="data-anno">
        <xsl:text>substitution</xsl:text>
        <xsl:if test="@rend">
            <xsl:text> (</xsl:text><xsl:value-of select="@rend"/><xsl:text>)</xsl:text>
        </xsl:if>
    </xsl:attribute>
    <xsl:apply-templates />
    </xsl:element>
</xsl:template>

<xsl:template match="x:supplied">
    <xsl:element name="span">
        <xsl:attribute name="class">supplied</xsl:attribute>
        <xsl:attribute name="data-anno">
            <xsl:text>supplied</xsl:text>
            <xsl:if test="@reason">
                <xsl:text> (</xsl:text><xsl:value-of select="@reason"/><xsl:text>)</xsl:text>
            </xsl:if>
        </xsl:attribute>
        <xsl:apply-templates />
    </xsl:element>
</xsl:template>

<xsl:template match="x:pc">
    <xsl:element name="span">
        <xsl:attribute name="class">invisible</xsl:attribute>
        <xsl:apply-templates/>
    </xsl:element>
</xsl:template>

<xsl:template match="x:sic">
    <xsl:element name="span">
        <xsl:attribute name="class">sic</xsl:attribute>
        <xsl:call-template name="lang"/>
        <xsl:attribute name="data-anno">sic</xsl:attribute>
        <xsl:apply-templates/>
    </xsl:element>
</xsl:template>

<xsl:template match="x:gap">
    <xsl:element name="span">
        <xsl:attribute name="lang">en</xsl:attribute>
        <xsl:attribute name="class">gap</xsl:attribute>
        <xsl:attribute name="data-anno">
            <xsl:text>gap</xsl:text>
                <xsl:choose>
                    <xsl:when test="@quantity">
                        <xsl:text> of </xsl:text><xsl:value-of select="@quantity"/>
                        <xsl:choose>
                        <xsl:when test="@unit">
                        <xsl:text> </xsl:text><xsl:value-of select="@unit"/>
                        </xsl:when>
                        <xsl:otherwise>
                        <xsl:text> akṣara</xsl:text>
                        </xsl:otherwise>
                        </xsl:choose>
                            <xsl:if test="@quantity &gt; '1'">
                                <xsl:text>s</xsl:text>
                            </xsl:if>
                    </xsl:when>
                    <xsl:when test="@extent">
                        <xsl:text> of </xsl:text><xsl:value-of select="@extent"/>
                    </xsl:when>
                </xsl:choose>
                <xsl:if test="@reason">
                    <xsl:text> (</xsl:text><xsl:value-of select="@reason"/><xsl:text>)</xsl:text>
                </xsl:if>
        </xsl:attribute>
        <xsl:choose>
            <xsl:when test="count(./*) &gt; 0">
                <xsl:text>[</xsl:text>
                <xsl:apply-templates/>
                <xsl:text>]</xsl:text>
            </xsl:when>
            <xsl:otherwise>
                <xsl:element name="span">
                <xsl:text>...</xsl:text>
                <xsl:choose>
                    <xsl:when test="@quantity &gt; 1">
                        <xsl:call-template name="repeat">
                            <xsl:with-param name="output"><xsl:text>..</xsl:text></xsl:with-param>
                            <xsl:with-param name="count" select="@quantity"/>
                        </xsl:call-template>

                    </xsl:when>
                    <xsl:when test="@extent">
                        <xsl:variable name="extentnum" select="translate(@extent,translate(@extent,'0123456789',''),'')"/>
                        <xsl:if test="number($extentnum) &gt; 1">
                            <xsl:call-template name="repeat">
                                <xsl:with-param name="output"><xsl:text>..</xsl:text></xsl:with-param>
                                <xsl:with-param name="count" select="$extentnum"/>
                            </xsl:call-template>
                        </xsl:if>
                    </xsl:when>
                </xsl:choose>
                </xsl:element>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:element>
</xsl:template>

<xsl:template match="x:space">
    <xsl:element name="span">
        <xsl:attribute name="lang">en</xsl:attribute>
        <xsl:attribute name="class">space</xsl:attribute>
        <xsl:attribute name="data-anno">
            <xsl:text>space</xsl:text>
            <xsl:if test="@quantity">
                <xsl:text> of </xsl:text><xsl:value-of select="@quantity"/>
                <xsl:choose>
                <xsl:when test="@unit">
                <xsl:text> </xsl:text><xsl:value-of select="@unit"/>
                    <xsl:if test="@quantity &gt; '1'">
                        <xsl:text>s</xsl:text>
                    </xsl:if>
                </xsl:when>
                <xsl:otherwise>
                <xsl:text> akṣara</xsl:text>
                    <xsl:if test="@quantity &gt; '1'">
                        <xsl:text>s</xsl:text>
                    </xsl:if>
                </xsl:otherwise>
                </xsl:choose>
            </xsl:if>
            <xsl:if test="@rend">
                <xsl:text> (</xsl:text><xsl:value-of select="@rend"/><xsl:text>)</xsl:text>
            </xsl:if>
        </xsl:attribute>
        <xsl:choose>
            <xsl:when test="count(./*) &gt; 0">
                <xsl:apply-templates/>
            </xsl:when>
            <xsl:otherwise>
                <xsl:element name="span">
                <xsl:text>_</xsl:text>
                <xsl:choose>
                    <xsl:when test="@quantity &gt; 1">
                        <xsl:call-template name="repeat">
                            <xsl:with-param name="output"><xsl:text>_&#x200B;</xsl:text></xsl:with-param>
                            <xsl:with-param name="count" select="@quantity"/>
                        </xsl:call-template>

                    </xsl:when>
                    <xsl:when test="@extent">
                        <xsl:variable name="extentnum" select="translate(@extent,translate(@extent,'0123456789',''),'')"/>
                        <xsl:if test="number($extentnum) &gt; 1">
                            <xsl:call-template name="repeat">
                                <xsl:with-param name="output"><xsl:text>_&#x200B;</xsl:text></xsl:with-param>
                                <xsl:with-param name="count" select="$extentnum"/>
                            </xsl:call-template>
                        </xsl:if>
                    </xsl:when>
                </xsl:choose>
                </xsl:element>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:element>
</xsl:template>

<xsl:template match="x:g">
        <xsl:element name="span">
            <xsl:attribute name="class">gaiji</xsl:attribute>
            <xsl:variable name="ref" select="@ref"/>
            <xsl:variable name="ename" select="$defRoot//my:entitynames/my:entry[@key=$ref]"/>
            <xsl:if test="$ename">
                <xsl:attribute name="data-anno"><xsl:value-of select="$ename"/></xsl:attribute>
            </xsl:if>
            <xsl:variable name="txt" select="$defRoot//my:entities/my:entry[@key=$ref]"/>

            <xsl:if test="$txt">
                <xsl:value-of select="$txt"/>
            </xsl:if>
        </xsl:element>
</xsl:template>

<xsl:template match="x:div1">
    <xsl:element name="section">
        <xsl:apply-templates/>
    </xsl:element>
</xsl:template>
<xsl:template match="x:div2">
    <xsl:element name="section">
        <xsl:apply-templates/>
    </xsl:element>
</xsl:template>
<xsl:template match="x:div3">
    <xsl:element name="section">
        <xsl:apply-templates/>
    </xsl:element>
</xsl:template>

<xsl:template match="x:div1/x:head">
    <xsl:element name="h2">
        <xsl:apply-templates/>
    </xsl:element>
</xsl:template>
<xsl:template match="x:div2/x:head">
    <xsl:element name="h3">
        <xsl:apply-templates/>
    </xsl:element>
</xsl:template>
<xsl:template match="x:div3/x:head">
    <xsl:element name="h4">
        <xsl:apply-templates/>
    </xsl:element>
</xsl:template>

<xsl:template match="x:list">
    <xsl:element name="ul">
        <xsl:call-template name="lang"/>
        <xsl:apply-templates/>
    </xsl:element>
</xsl:template>
<xsl:template match="x:list[@rend='numbered']">
    <xsl:element name="ol">
        <xsl:apply-templates/>
    </xsl:element>
</xsl:template>
<xsl:template match="x:item">
    <xsl:element name="li">
        <xsl:apply-templates/>
    </xsl:element>
</xsl:template>

<xsl:template match="x:unclear">
    <xsl:element name="span">
        <xsl:attribute name="class">unclear</xsl:attribute>
        <xsl:attribute name="data-anno">
            <xsl:text>unclear</xsl:text>
            <xsl:if test="@reason">
                <xsl:text> (</xsl:text>
                <xsl:value-of select="@reason"/>
                <xsl:text>)</xsl:text>
            </xsl:if>
        </xsl:attribute>
        <xsl:apply-templates/>
    </xsl:element>
</xsl:template>

<xsl:template match="x:interp">
    <xsl:element name="span">
        <xsl:attribute name="class">interp</xsl:attribute>
        <xsl:attribute name="data-anno">
            <xsl:value-of select="@type"/>
        </xsl:attribute>
    </xsl:element>
</xsl:template>

<xsl:template match="x:caesura">
<xsl:variable name="pretext" select="preceding::text()[1]"/>
<xsl:if test="normalize-space(substring($pretext,string-length($pretext))) != ''">
    <span class="caesura">-</span>
</xsl:if>
    <xsl:element name="br">
    <xsl:attribute name="class">caesura</xsl:attribute>
    </xsl:element>
</xsl:template>

<xsl:template match="x:expan">
    <xsl:element name="span">
        <xsl:call-template name="lang"/>
        <xsl:attribute name="class">expan</xsl:attribute>
        <xsl:attribute name="data-anno">abbreviation</xsl:attribute>
        <xsl:apply-templates/>
    </xsl:element>
</xsl:template>

<xsl:template match="x:ex">
    <xsl:element name="span">
        <xsl:call-template name="lang"/>
        <xsl:attribute name="class">ex</xsl:attribute>
        <xsl:attribute name="data-anno">editorial expansion</xsl:attribute>
        <xsl:apply-templates/>
    </xsl:element>
</xsl:template>

<xsl:template match="x:note">
<xsl:element name="span">
    <xsl:call-template name="lang"/>
    <xsl:attribute name="class">note
        <xsl:choose>
            <xsl:when test="@place='above' or @place='top-margin' or @place='left-margin'"> super</xsl:when>
            <xsl:when test="@place='below' or @place='bottom-margin' or @place='right-margin'"> sub</xsl:when>
            <xsl:otherwise> inline</xsl:otherwise>
        </xsl:choose>
    </xsl:attribute>
    <xsl:attribute name="data-anno">note
        <xsl:if test="@place"> (<xsl:value-of select="@place"/>)</xsl:if>
        <xsl:if test="@resp"> (by <xsl:value-of select="@resp"/>)</xsl:if>
    </xsl:attribute>
    <xsl:apply-templates />
</xsl:element>
</xsl:template>

<xsl:template match="x:seg">
    <xsl:element name="span">
        <xsl:variable name="func" select="@function"/>
        <xsl:if test="$func">
            <xsl:attribute name="data-anno">
                <xsl:variable name="funcname" select="$defRoot//my:additiontype/my:entry[@key=$func]"/>
                <xsl:choose>
                    <xsl:when test="$funcname">
                        <xsl:value-of select="$funcname"/>
                    </xsl:when>
                    <xsl:otherwise>
                        <xsl:value-of select="$func"/>
                    </xsl:otherwise>
                </xsl:choose>
            </xsl:attribute>
        </xsl:if>
        <xsl:apply-templates/>
    </xsl:element>
</xsl:template>

<xsl:template match="@*|node()">
    <xsl:copy>
    <xsl:apply-templates select="@*|node()"/>
    </xsl:copy>
</xsl:template>

</xsl:stylesheet>
