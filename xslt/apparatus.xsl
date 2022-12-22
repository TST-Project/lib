<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" 
                xmlns:exsl="http://exslt.org/common"
                xmlns:x="http://www.tei-c.org/ns/1.0"
                xmlns:tst="https://github.com/tst-project"
                exclude-result-prefixes="x tst exsl">

<xsl:output method="html" encoding="UTF-8" omit-xml-declaration="yes"/>

<xsl:template name="splitwit">
    <xsl:param name="mss" select="@wit"/>
        <xsl:if test="string-length($mss)">
            <!--xsl:if test="not($mss=@wit)"><xsl:text>,</xsl:text></xsl:if-->
            <xsl:element name="span">
                 <xsl:attribute name="class">msid</xsl:attribute>
                 <xsl:attribute name="lang">en</xsl:attribute>
                 <xsl:variable name="msstring" select="substring-before(
                                            concat($mss,' '),
                                          ' ')"/>
                 <xsl:variable name="cleanstr" select="substring-after($msstring,'#')"/>
                 <xsl:variable name="witness" select="/x:TEI/x:teiHeader/x:fileDesc/x:sourceDesc/x:listWit/x:witness[@xml:id=$cleanstr]"/>
                 <xsl:variable name="siglum" select="$witness/x:abbr/node()"/>
                 <xsl:variable name="anno" select="$witness/x:expan"/>
                 <xsl:if test="$anno">
                     <xsl:attribute name="data-anno"/>
                     <xsl:element name="span">
                        <xsl:attribute name="class">anno-inline</xsl:attribute>
                         <xsl:apply-templates select="$anno"/>
                     </xsl:element>
                 </xsl:if>
                 <xsl:choose>
                    <xsl:when test="$siglum">
                        <xsl:apply-templates select="$siglum"/>
                    </xsl:when>
                    <xsl:otherwise>
                        <xsl:value-of select="$cleanstr"/>
                    </xsl:otherwise>
                </xsl:choose>
            </xsl:element>
            <xsl:call-template name="splitwit">
                <xsl:with-param name="mss" select=
                    "substring-after($mss, ' ')"/>
            </xsl:call-template>
        </xsl:if>
</xsl:template>

<xsl:template match="x:listWit"/>

<xsl:template match="x:text//x:p">
    <xsl:choose>
        <xsl:when test=".//x:app and not(//x:facsimile/x:graphic)">
            <div>
                <xsl:attribute name="class">para wide</xsl:attribute>
                <xsl:attribute name="id"><xsl:value-of select="@xml:id"/></xsl:attribute>
                <div>
                    <xsl:attribute name="class">text-block</xsl:attribute>
                    <xsl:call-template name="lang"/>
                    <xsl:apply-templates/>
                </div>
                <div>
                    <xsl:attribute name="class">apparatus-block</xsl:attribute>
                    <xsl:call-template name="lang"/>
                    <xsl:call-template name="apparatus"/>
                </div>
            </div>
        </xsl:when>
        <xsl:otherwise>
            <xsl:call-template name="p"/>
        </xsl:otherwise>
    </xsl:choose>
</xsl:template>

<xsl:template match="x:text//x:lg">
    <xsl:choose>
        <xsl:when test=".//x:app and not(//x:facsimile/x:graphic)">
            <div>
                <xsl:attribute name="class">lg wide</xsl:attribute>
                <xsl:attribute name="id"><xsl:value-of select="@xml:id"/></xsl:attribute>
                <div>
                    <xsl:attribute name="class">text-block</xsl:attribute>
                    <xsl:call-template name="lang"/>
                    <xsl:apply-templates/>
                </div>
                <div>
                    <xsl:attribute name="class">apparatus-block</xsl:attribute>
                    <xsl:call-template name="lang"/>
                    <xsl:call-template name="apparatus"/>
                </div>
            </div>
        </xsl:when>
        <xsl:otherwise>
            <xsl:call-template name="lg"/>
        </xsl:otherwise>
    </xsl:choose>
</xsl:template>

<xsl:template match="x:lem">
    <span class="lem-inline">
        <xsl:call-template name="lang"/>
        <xsl:apply-templates/>
    </span>
</xsl:template>

<!--xsl:template match="x:app">
        <xsl:apply-templates/>
</xsl:template-->

<xsl:template match="x:app">
    <span class="app-inline">
        <xsl:attribute name="data-anno"/>
        <span>
            <xsl:choose>
                <xsl:when test="x:lem">
                    <xsl:attribute name="class">lem-inline</xsl:attribute>
                    <xsl:call-template name="lang"/>
                    <xsl:apply-templates select="x:lem/node()"/>
                </xsl:when>
                <xsl:otherwise>
                        <xsl:attribute name="class">lem-inline lem-anchor</xsl:attribute>
                        <xsl:text>†</xsl:text>
                </xsl:otherwise>
            </xsl:choose>
        </span>
        <span class="anno-inline">
            <xsl:if test="x:rdg">
                <xsl:call-template name="lemma"/>
                <xsl:apply-templates select="x:rdg"/>
            </xsl:if>
            <xsl:for-each select="x:note">
                <xsl:text> </xsl:text>
                <xsl:apply-templates select="."/>
            </xsl:for-each>
        </span>
    </span>
</xsl:template>
<xsl:template match="x:rdg">
    <xsl:call-template name="reading"/>
</xsl:template>

<xsl:template match="x:abbr[@corresp]">
    <xsl:variable name="cleanstr" select="substring-after(@corresp,'#')"/>
    <xsl:element name="span">
         <xsl:attribute name="class">msid</xsl:attribute>
         <xsl:attribute name="lang">en</xsl:attribute>
         <xsl:variable name="witness" select="/x:TEI/x:teiHeader/x:fileDesc/x:sourceDesc/x:listWit/x:witness[@xml:id=$cleanstr]"/>
         <xsl:variable name="siglum" select="$witness/x:abbr/node()"/>
         <xsl:variable name="anno" select="$witness/x:expan"/>
         <xsl:if test="$anno">
             <xsl:attribute name="data-anno"></xsl:attribute>
             <xsl:element name="span">
                <xsl:attribute name="class">anno-inline</xsl:attribute>
                 <xsl:apply-templates select="$anno"/>
             </xsl:element>
         </xsl:if>
         <xsl:apply-templates select="$witness/x:abbr/node()"/>
    </xsl:element>
</xsl:template>

<xsl:template name="apparatus">
    <xsl:for-each select=".//x:app">
        <span class="app">
            <xsl:choose>
                <xsl:when test="x:lem">
                    <xsl:call-template name="lemma"/>
                </xsl:when>
                <xsl:otherwise>
                    <span class="lem lem-anchor">†</span>
                </xsl:otherwise>
            </xsl:choose>
            <xsl:if test="x:rdg">
                <span>
                    <xsl:for-each select="x:rdg">
                        <xsl:call-template name="reading"/>
                    </xsl:for-each>
                </span>
            </xsl:if>
            <xsl:for-each select="x:note">
                <xsl:text> </xsl:text>
                <xsl:apply-templates select="."/>
            </xsl:for-each>
        </span>
        <xsl:text> </xsl:text>
    </xsl:for-each>
    <!--xsl:for-each select=".//x:note[@place='apparatus']">
        <span class="note">
            <xsl:apply-templates select="./node()"/>
        </span>
    </xsl:for-each-->
</xsl:template>

<xsl:template name="lemma">
    <span>
        <xsl:attribute name="class">lem</xsl:attribute>
        <xsl:apply-templates select="x:lem/node()"/>
    </span>
    <xsl:if test="x:lem/@wit">
        <span>
            <xsl:attribute name="class">lem-wit</xsl:attribute>
            <xsl:call-template name="splitwit">
                <xsl:with-param name="mss" select="x:lem/@wit"/>
            </xsl:call-template>
        </span>
    </xsl:if>
    <xsl:text> </xsl:text>
</xsl:template>

<xsl:template name="reading">
    <span>
        <xsl:attribute name="class">rdg</xsl:attribute>
        <span>
            <xsl:attribute name="class">rdg-text</xsl:attribute>
            <xsl:choose>
                <xsl:when test="./node()">
                    <xsl:apply-templates select="./node()"/>
                </xsl:when>
                <xsl:otherwise>
                    <span lang="en">[om.]</span>
                </xsl:otherwise>
            </xsl:choose>
        </span>
        <xsl:text> </xsl:text>
        <span>
            <xsl:attribute name="class">rdg-wit</xsl:attribute>
            <xsl:call-template name="splitwit"/>
        </span>
    </span>
    <xsl:text> </xsl:text>
</xsl:template>

</xsl:stylesheet>
